package com.jeplabs.ecommerce.infra.config;

import cl.transbank.common.IntegrationApiKeys;
import cl.transbank.common.IntegrationCommerceCodes;
import cl.transbank.common.IntegrationType;
import cl.transbank.webpay.common.WebpayOptions;
import cl.transbank.webpay.webpayplus.WebpayPlus;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebpayConfig {

    @Value("${api.webpay.ambiente}")
    private String ambiente;

    @Value("${api.webpay.commerce-code:}")
    private String commerceCode;

    @Value("${api.webpay.api-key:}")
    private String apiKey;

    @PostConstruct
    public void validar() {
        if ("produccion".equals(ambiente)) {
            if (commerceCode == null || commerceCode.isBlank()) {
                throw new IllegalStateException(
                        "api.webpay.commerce-code es obligatorio en producción");
            }
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException(
                        "api.webpay.api-key es obligatorio en producción");
            }
        }
    }

    public WebpayPlus.Transaction crearTransaction() {
        if ("produccion".equals(ambiente)) {
            return new WebpayPlus.Transaction(
                    new WebpayOptions(commerceCode, apiKey, IntegrationType.LIVE));
        }
        // Integración: usa credenciales de prueba incluidas en el SDK
        return new WebpayPlus.Transaction(
                new WebpayOptions(
                        IntegrationCommerceCodes.WEBPAY_PLUS,
                        IntegrationApiKeys.WEBPAY,
                        IntegrationType.TEST));
    }
}