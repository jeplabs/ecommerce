package com.jeplabs.ecommerce.domain.envio;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record DatosCrearServicioEnvio(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "La tarifa es obligatoria")
        @DecimalMin(value = "0.0", message = "La tarifa no puede ser negativa")
        BigDecimal tarifa,

        @NotNull(message = "El recargo contra entrega es obligatorio")
        @DecimalMin(value = "0.0", message = "El recargo no puede ser negativo")
        BigDecimal recargoContraEntrega,

        String logoUrl,
        boolean servicioExpress
) {}
