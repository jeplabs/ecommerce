package com.jeplabs.ecommerce.domain.pago.webpay;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "api.webpay.scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class WebpayReconciliacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(WebpayReconciliacionScheduler.class);

    private final WebpayService webpayService;

    // Ejecuta periódicamente para marcar como TIMEOUT transacciones Webpay abandonadas (> 15 minutos)
    @Scheduled(
            fixedDelayString = "${api.webpay.scheduler.intervalo:PT15M}",
            initialDelayString = "${api.webpay.scheduler.delay-inicial:PT1M}"
    )
    public void expirarTransaccionesAbandonadas() {
        int expiradas = webpayService.reconciliarTransaccionesExpiradas(15);
        if (expiradas > 0) {
            log.info("WebpayReconciliacionScheduler: se marcaron {} transacciones Webpay abandonadas como TIMEOUT", expiradas);
        }
    }
}
