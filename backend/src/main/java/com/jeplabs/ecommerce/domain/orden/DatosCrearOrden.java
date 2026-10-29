package com.jeplabs.ecommerce.domain.orden;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DatosCrearOrden(

        Long direccionId,

        Long sucursalId,

        @NotNull(message = "El servicio de envío es obligatorio")
        Long servicioEnvioId,

        @NotNull(message = "La forma de pago es obligatoria")
        FormaPagoEnvio formaPagoEnvio,

        @NotBlank(message = "El método de pago es obligatorio")
        String metodoPagoCodigo,

        String notas
) {
    public DatosCrearOrden(
            Long direccionId,
            Long servicioEnvioId,
            FormaPagoEnvio formaPagoEnvio,
            String metodoPagoCodigo,
            String notas
    ) {
        this(direccionId, null, servicioEnvioId, formaPagoEnvio, metodoPagoCodigo, notas);
    }
}
