package com.jeplabs.ecommerce.domain.orden.scheduler;

import com.jeplabs.ecommerce.domain.orden.EstadoOrden;
import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenRepository;
import com.jeplabs.ecommerce.domain.orden.OrdenService;
import com.jeplabs.ecommerce.domain.pago.webpay.DatosEstadoWebpay;
import com.jeplabs.ecommerce.domain.pago.webpay.EstadoWebpayTransaccion;
import com.jeplabs.ecommerce.domain.pago.webpay.WebpayService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "api.orden.scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class OrdenExpiracionScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrdenExpiracionScheduler.class);

    private final OrdenRepository ordenRepository;
    private final OrdenService ordenService;
    private final WebpayService webpayService;

    @Value("${api.orden.expiracion-minutos:10}")
    private long expiracionMinutos;

    @Scheduled(
            fixedDelayString = "${api.orden.expiracion-fixed-delay-ms:300000}",
            initialDelayString = "${api.orden.expiracion-delay-inicial-ms:120000}"
    )
    public void expirarOrdenesPendientes() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(expiracionMinutos);
        List<Orden> ordenesExpiradas = ordenRepository.findByEstadoAndCreadoAtBefore(EstadoOrden.PENDIENTE, limite);

        int expiradas = 0;
        for (Orden orden : ordenesExpiradas) {
            if (noHayPagoAprobado(orden)) {
                try {
                    ordenService.expiracionAutomatica(orden.getId()); // Pasamos solo el ID
                    expiradas++;
                    log.info("Orden {} expirada automáticamente y stock devuelto", orden.getId());
                } catch (Exception e) {
                    log.error("Error al expirar automáticamente la orden {}: {}", orden.getId(), e.getMessage());
                }
            }
        }

        if (expiradas > 0) {
            log.info("OrdenExpiracionScheduler: se expiraron {} órdenes pendientes", expiradas);
        }
    }

    private boolean noHayPagoAprobado(Orden orden) {
        try {
            // Consultar estado en WebpayService verifica en tiempo real si existe y su estado real en Transbank
            DatosEstadoWebpay estadoPago = webpayService.consultarEstado(orden.getId());
            return estadoPago.estado() != EstadoWebpayTransaccion.APROBADA;
        } catch (IllegalArgumentException e) {
            // Si no existe transacción Webpay para la orden, entonces no hay pago y se puede cancelar.
            return true;
        } catch (Exception e) {
            // Si hay un error consultando Transbank (timeout de red, etc), preferimos no cancelar la orden aún.
            log.warn("No se pudo verificar el estado de pago para la orden {}. Se difiere su expiración. Error: {}", orden.getId(), e.getMessage());
            return false;
        }
    }
}
