package com.jeplabs.ecommerce.infra.config;

import java.math.BigDecimal;

public record ConfiguracionGlobal(
        DatosRespuestaMoneda moneda,
        BigDecimal montoMinimoEnvioGratis,
        String storageProvider
) {}
