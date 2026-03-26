package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.constraints.NotNull;

// DTO para que el admin cambie el estado del producto, manualmente.

public record DatosActualizarEstado(
        @NotNull(message = "El estado es obligatorio")
        EstadoProducto estado
) {}
