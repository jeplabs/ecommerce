package com.jeplabs.ecommerce.domain.pago.webpay;

import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCommitResponse;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCreateResponse;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionStatusResponse;
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
import java.time.LocalDateTime;
import java.util.List;
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
            // Si fue iniciada hace menos de 10 minutos (tiempo de vida del token Webpay), la reutilizamos
            if (tx.getCreadoAt().isAfter(LocalDateTime.now().minusMinutes(10))) {
                return new DatosRespuestaIniciarWebpay(tx.getToken(), tx.getUrl());
            } else {
                // CASO 1 FIX: Antes de marcar TIMEOUT, consultar el estado real en Transbank
                // para evitar doble cobro si el cliente pagó pero perdió el retorno
                verificarYActualizarEstadoTransaccion(tx, 10);

                if (tx.estaAprobada()) {
                    // El pago SÍ fue exitoso en Transbank: la orden ya fue confirmada
                    // internamente por verificarYActualizarEstadoTransaccion() → no crear nueva
                    throw new IllegalStateException(
                            "Esta orden ya fue pagada exitosamente. " +
                            "Revisa el estado de tu orden.");
                }
                // Si no fue aprobada (TIMEOUT, REJECTED, ABORTED), ya fue marcada
                // apropiadamente → se puede crear una nueva transacción
            }
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

    // ─── PRIORIDAD 3: Estado para polling y reconciliación en tiempo real ────

    @Transactional
    public DatosEstadoWebpay consultarEstado(Long ordenId) {
        WebpayTransaccion tx = transaccionRepositorio.findByOrdenId(ordenId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No existe transacción Webpay para la orden: " + ordenId));

        if (tx.estaIniciada()) {
            verificarYActualizarEstadoTransaccion(tx, 10);
        }

        return new DatosEstadoWebpay(ordenId, tx.getEstado(), tx.getMotivo());
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

    // ─── PRIORIDAD 5: Reconciliación activa de transacciones abandonadas ─────

    @Transactional
    public int reconciliarTransaccionesExpiradas(int minutosExpiracion) {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(minutosExpiracion);
        List<WebpayTransaccion> transaccionesIniciadas = transaccionRepositorio
                .findByEstadoAndCreadoAtBefore(EstadoWebpayTransaccion.INICIADA, limite);

        int reconciliadas = 0;
        for (WebpayTransaccion tx : transaccionesIniciadas) {
            verificarYActualizarEstadoTransaccion(tx, minutosExpiracion);
            reconciliadas++;
        }
        return reconciliadas;
    }

    // ─── PRIORIDAD 6: Reembolso ──────────────────────────────────────────────

    @Transactional
    public DatosRespuestaRefundWebpay reembolsar(Long ordenId) {
        WebpayTransaccion tx = transaccionRepositorio
                .findByOrdenIdAndEstado(ordenId, EstadoWebpayTransaccion.APROBADA)
                .orElseThrow(() -> new IllegalArgumentException("No hay pago aprobado que reembolsar"));
        
        try {
            // Ejecutar el refund en Transbank
            cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionRefundResponse response = 
                    webpayConfig.crearTransaction().refund(tx.getToken(), tx.getMonto().intValue());
            
            // Independientemente del tipo ("REVERSED" o "NULLIFIED"), si no lanza excepción, fue exitoso.
            tx.marcarReembolsada();
            transaccionRepositorio.save(tx);
            
            // Llamar a ordenService para finalizar la orden no se puede hacer directamente 
            // aquí para evitar dependencias circulares, el Controller orquestará esto o
            // podemos usar Eventos. Para mantenerlo simple, delegamos al servicio de Órdenes
            // que cambie el estado luego.
            
            return new DatosRespuestaRefundWebpay(ordenId, EstadoWebpayTransaccion.REEMBOLSADA);
        } catch (Exception e) {
            throw new RuntimeException("Error al reembolsar en Transbank: " + e.getMessage());
        }
    }

    // ─── Métodos privados ─────────────────────────────────────────────────────

    private void verificarYActualizarEstadoTransaccion(WebpayTransaccion tx, int minutosExpiracion) {
        try {
            WebpayPlusTransactionStatusResponse status =
                    webpayConfig.crearTransaction().status(tx.getToken());

            if (status != null && "AUTHORIZED".equalsIgnoreCase(status.getStatus())
                    && status.getResponseCode() == 0) {
                // Pago completado con éxito
                procesarAprobadaStatus(tx, status);
            } else if (status != null && "FAILED".equalsIgnoreCase(status.getStatus())) {
                // Rechazo explícito en Transbank / Tarjeta rechazada por el banco
                tx.rechazar(MotivoRechazoWebpay.REJECTED, status.getResponseCode());
                transaccionRepositorio.save(tx);
            } else if (tx.getCreadoAt().isBefore(LocalDateTime.now().minusMinutes(minutosExpiracion))) {
                // Transacción en INITIALIZED (o no completada) que superó el tiempo límite
                tx.rechazar(MotivoRechazoWebpay.TIMEOUT, null);
                transaccionRepositorio.save(tx);
            }
        } catch (Exception e) {
            // Si Transbank rechaza la consulta de status (token expirado o no encontrado)
            if (tx.getCreadoAt().isBefore(LocalDateTime.now().minusMinutes(minutosExpiracion))) {
                tx.rechazar(MotivoRechazoWebpay.TIMEOUT, null);
                transaccionRepositorio.save(tx);
            }
        }
    }

    private DatosRespuestaConfirmarWebpay procesarAprobada(
            WebpayTransaccion transaccion,
            WebpayPlusTransactionCommitResponse response) {

        // CASO 7: Validar que el monto cobrado coincida con el de la orden
        if (BigDecimal.valueOf(response.getAmount()).compareTo(transaccion.getMonto()) != 0) {
            transaccion.rechazar(MotivoRechazoWebpay.REJECTED, response.getResponseCode());
            return DatosRespuestaConfirmarWebpay.fallido(
                    "El monto cobrado no coincide con el total de la orden", MotivoRechazoWebpay.REJECTED);
        }

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

    private void procesarAprobadaStatus(
            WebpayTransaccion transaccion,
            WebpayPlusTransactionStatusResponse response) {

        // CASO 7: Validar que el monto cobrado coincida con el de la orden
        if (BigDecimal.valueOf(response.getAmount()).compareTo(transaccion.getMonto()) != 0) {
            transaccion.rechazar(MotivoRechazoWebpay.REJECTED, response.getResponseCode());
            transaccionRepositorio.save(transaccion);
            throw new IllegalStateException("El monto cobrado (" + response.getAmount() + 
                    ") no coincide con el total de la orden (" + transaccion.getMonto() + ")");
        }

        transaccion.aprobar(
                response.getBuyOrder(),
                response.getAuthorizationCode(),
                response.getCardDetail() != null
                        ? response.getCardDetail().getCardNumber() : null,
                response.getPaymentTypeCode(),
                response.getInstallmentsNumber(),
                response.getResponseCode()
        );
        transaccionRepositorio.save(transaccion);

        Orden orden = transaccion.getOrden();
        if (orden.getEstado() == EstadoOrden.PENDIENTE) {
            orden.cambiarEstado(EstadoOrden.CONFIRMADA);
            ordenRepositorio.save(orden);

            emailService.enviarConfirmacionOrden(
                    orden.getUsuario().getEmail(),
                    orden.getUsuario().getNombre(),
                    orden.getId()
            );
        }
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