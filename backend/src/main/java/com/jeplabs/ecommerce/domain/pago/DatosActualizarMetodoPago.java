package com.jeplabs.ecommerce.domain.pago;

import jakarta.validation.constraints.Min;
import java.util.Map;

public record DatosActualizarMetodoPago(
        String nombre,
        String descripcion,

        @Min(value = 1, message = "El orden mínimo es 1")
        Integer ordenVisualizacion,

        Map<String, Object> configuracion
) {}