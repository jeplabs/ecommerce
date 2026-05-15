package com.jeplabs.ecommerce.domain.orden;

import jakarta.validation.constraints.NotNull;

public record DatosActualizarEstadoOrden(
        @NotNull(message = "El estado es obligatorio")
        EstadoOrden estado
) {}