package com.jeplabs.ecommerce.domain.orden;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosActualizarMetodoPago(
        @NotBlank(message = "El método de pago es obligatorio")
        String metodoPagoCodigo,

        @NotNull(message = "La forma de pago del envío es obligatoria")
        FormaPagoEnvio formaPagoEnvio
) {}
