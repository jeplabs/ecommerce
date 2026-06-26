package com.jeplabs.ecommerce.domain.pago;

import jakarta.validation.constraints.*;
import java.util.Map;

public record DatosCrearMetodoPago(

        @NotBlank(message = "El código es obligatorio")
        String codigo,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "El tipo es obligatorio")
        TipoMetodoPago tipo,

        @NotNull(message = "El orden de visualización es obligatorio")
        @Min(value = 1, message = "El orden mínimo es 1")
        Integer ordenVisualizacion,

        Map<String, Object> configuracion
) {}
