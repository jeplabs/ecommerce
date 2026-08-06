package com.jeplabs.ecommerce.domain.pago.webpay;

import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCommitResponse;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCreateResponse;
import com.jeplabs.ecommerce.domain.orden.*;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.infra.config.WebpayConfig;
import com.jeplabs.ecommerce.infra.email.EmailService;
import com.jeplabs.ecommerce.infra.exceptions.OrdenNoEncontradaException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebpayService {

    private final WebpayTransaccionRepository transaccionRepositorio;
    private final OrdenRepository ordenRepositorio;
    private final UsuarioRepository usuarioRepositorio;
    private final EmailService emailService;
    private final WebpayConfig webpayConfig;

    @Value("${api.webpay.return-url}")
    private String returnUrl;

    // ─── PRIORIDAD 1: Iniciar transacción ────────────────────────────────────

    @Transactional
    public DatosRespuestaIniciarWebpay iniciar(String email, DatosIniciarWebpay datos) {
        Usuario usuario = buscarUsuario(email);
        Orden orden = ordenRepositorio.findByIdAndUsuarioId(
                        datos.ordenId(), usuario.getId())
                .orElseThrow(() -> new OrdenNoEncontradaException(datos.ordenId()));

        validarOrdenParaPago(orden);

        // CASO BORDE PRIORIDAD 1: evitar duplicados por doble clic o retry
        var transaccionExistente = transaccionRepositorio
                .findByOrdenIdAndEstado(orden.getId(), EstadoWebpayTransaccion.INICIADA);

        if (transaccionExistente.isPresent()) {
            WebpayTransaccion tx = transaccionExistente.get();
            return new DatosRespuestaIniciarWebpay(tx.getToken(), tx.getUrl());
        }

        try {
            String buyOrder = "ORD-" + orden.getId() + "-" +
                    UUID.randomUUID().toString().substring(0, 8);
            String sessionId = UUID.randomUUID().toString();

            // Monto SIEMPRE desde la BD, nunca del request
            double monto = orden.getTotal().doubleValue();

            WebpayPlusTransactionCreateResponse response =
                    webpayConfig.crearTransaction()
                            .create(buyOrder, sessionId, monto, returnUrl);

            WebpayTransaccion transaccion = new WebpayTransaccion(
                    orden, response.getToken(), buyOrder,
                    sessionId, orden.getTotal(), response.getUrl()); // ← URL guardada

            transaccionRepositorio.save(transaccion);

            return new DatosRespuestaIniciarWebpay(
                    response.getToken(), response.getUrl());

        } catch (Exception e) {
            throw new RuntimeException(
                    "Error al iniciar transacción con Webpay: " + e.getMessage());
        }
    }

    // ─── PRIORIDAD 2: Confirmar transacción ──────────────────────────────────

    @Transactional
    public DatosRespuestaConfirmarWebpay confirmar(String tokenWs, String tbkToken) {

        // CASO BORDE PRIORIDAD 2: ABORTED o TIMEOUT
        if (tokenWs == null && tbkToken != null) {
            return procesarAbortado(tbkToken);
        }

        if (tokenWs == null) {
            return DatosRespuestaConfirmarWebpay.fallido(
                    "Token de pago no recibido", MotivoRechazoWebpay.ABORTED);
        }

        WebpayTransaccion transaccion = transaccionRepositorio
                .findByToken(tokenWs)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Transacción no encontrada para el token proporcionado"));

        // CASO BORDE PRIORIDAD 2: doble confirmación
        if (transaccion.estaTerminada()) {
            return construirRespuestaDesdeTransaccion(transaccion);
        }

        try {
            WebpayPlusTransactionCommitResponse response =
                    webpayConfig.crearTransaction().commit(tokenWs);

            if (response.getResponseCode() == 0) {
                return procesarAprobada(transaccion, response);
            } else {
                return procesarRechazada(transaccion, response.getResponseCode());
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Error al confirmar transacción con Webpay: " + e.getMessage());
        }
    }

    // ─── PRIORIDAD 3: Estado para polling ────────────────────────────────────

    public DatosEstadoWebpay consultarEstado(Long ordenId) {
        return transaccionRepositorio.findByOrdenId(ordenId)
                .map(tx -> new DatosEstadoWebpay(
                        ordenId, tx.getEstado(), tx.getMotivo()))
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe transacción Webpay para la orden: " + ordenId));
    }

    // ─── PRIORIDAD 4: Webhook (producción) ───────────────────────────────────

    @Transactional
    public void procesarWebhook(String tokenWs) {
        transaccionRepositorio.findByToken(tokenWs).ifPresent(transaccion -> {
            if (transaccion.estaIniciada()) {
                try {
                    WebpayPlusTransactionCommitResponse response =
                            webpayConfig.crearTransaction().commit(tokenWs);
                    if (response.getResponseCode() == 0) {
                        procesarAprobada(transaccion, response);
                    } else {
                        procesarRechazada(transaccion, response.getResponseCode());
                    }
                } catch (Exception e) {
                    System.err.println("Error en webhook Webpay: " + e.getMessage());
                }
            }
        });
    }

    // ─── Métodos privados ─────────────────────────────────────────────────────

    private DatosRespuestaConfirmarWebpay procesarAprobada(
            WebpayTransaccion transaccion,
            WebpayPlusTransactionCommitResponse response) {

        transaccion.aprobar(
                response.getBuyOrder(),
                response.getAuthorizationCode(),
                response.getCardDetail() != null
                        ? response.getCardDetail().getCardNumber() : null,
                response.getPaymentTypeCode(),
                response.getInstallmentsNumber(),
                response.getResponseCode()
        );

        Orden orden = transaccion.getOrden();
        orden.cambiarEstado(EstadoOrden.CONFIRMADA);

        emailService.enviarConfirmacionOrden(
                orden.getUsuario().getEmail(),
                orden.getUsuario().getNombre(),
                orden.getId()
        );

        DatosPagoWebpay payment = new DatosPagoWebpay(
                response.getBuyOrder(),
                response.getAuthorizationCode(),
                BigDecimal.valueOf(response.getAmount()),
                response.getCardDetail() != null
                        ? response.getCardDetail().getCardNumber() : null,
                response.getPaymentTypeCode(),
                response.getInstallmentsNumber()
        );

        return DatosRespuestaConfirmarWebpay.exitoso(
                new DatosRespuestaOrden(orden), payment);
    }

    private DatosRespuestaConfirmarWebpay procesarRechazada(
            WebpayTransaccion transaccion, Byte responseCode) {
        transaccion.rechazar(MotivoRechazoWebpay.REJECTED, responseCode);
        return DatosRespuestaConfirmarWebpay.fallido(
                "Tu tarjeta fue rechazada", MotivoRechazoWebpay.REJECTED);
    }

    private DatosRespuestaConfirmarWebpay procesarAbortado(String tbkToken) {
        transaccionRepositorio.findByToken(tbkToken).ifPresent(tx -> {
            if (tx.estaIniciada()) {
                tx.rechazar(MotivoRechazoWebpay.ABORTED, null);
            }
        });
        return DatosRespuestaConfirmarWebpay.fallido(
                "No completaste el pago", MotivoRechazoWebpay.ABORTED);
    }

    private DatosRespuestaConfirmarWebpay construirRespuestaDesdeTransaccion(
            WebpayTransaccion tx) {
        if (tx.estaAprobada()) {
            DatosPagoWebpay payment = new DatosPagoWebpay(
                    tx.getTransactionId(),
                    tx.getAuthorizationCode(),
                    tx.getMonto(),
                    tx.getCardNumber(),
                    tx.getPaymentTypeCode(),
                    tx.getInstallments()
            );
            return DatosRespuestaConfirmarWebpay.exitoso(
                    new DatosRespuestaOrden(tx.getOrden()), payment);
        }

        String mensaje = tx.getMotivo() != null ? switch (tx.getMotivo()) {
            case ABORTED -> "No completaste el pago";
            case TIMEOUT -> "Se agotó el tiempo en Webpay";
            default      -> "Tu tarjeta fue rechazada";
        } : "Tu tarjeta fue rechazada";

        return DatosRespuestaConfirmarWebpay.fallido(mensaje, tx.getMotivo());
    }

    private void validarOrdenParaPago(Orden orden) {
        if (orden.getEstado() != EstadoOrden.PENDIENTE) {
            throw new IllegalArgumentException(
                    "Solo se pueden pagar órdenes en estado PENDIENTE");
        }
        if (orden.getTotal() == null ||
                orden.getTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "El total de la orden no es válido");
        }
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepositorio.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }
}