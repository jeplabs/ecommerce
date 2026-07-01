package com.jeplabs.ecommerce.domain.orden;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosCrearOrden(

        @NotNull(message = "La dirección de envío es obligatoria")
        Long direccionId,

        @NotNull(message = "El servicio de envío es obligatorio")
        Long servicioEnvioId,

        @NotNull(message = "La forma de pago es obligatoria")
        FormaPagoEnvio formaPagoEnvio,

        @NotBlank(message = "El método de pago es obligatorio")
        String metodoPagoCodigo,

        String notas
) {}
