package com.jeplabs.ecommerce.domain.envio;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;

public record DatosActualizarServicioEnvio(

        String nombre,
        String descripcion,

        @DecimalMin(value = "0.0", message = "La tarifa no puede ser negativa")
        BigDecimal tarifa,

        @DecimalMin(value = "0.0", message = "El recargo no puede ser negativo")
        BigDecimal recargoContraEntrega,

        String logoUrl,
        Boolean servicioExpress // Boolean con mayúscula para permitir null
) {}
