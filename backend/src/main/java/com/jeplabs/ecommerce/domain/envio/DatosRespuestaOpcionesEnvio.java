package com.jeplabs.ecommerce.domain.envio;

import java.math.BigDecimal;
import java.util.List;

public record DatosRespuestaOpcionesEnvio(
        boolean envioGratis,
        BigDecimal costoEnvio,          // null si no aplica envío gratis
        BigDecimal montoMinimoGratis,   // para mostrar "Faltan Q X para envío gratis"
        List<DatosRespuestaServicioEnvio> servicios
) {}
