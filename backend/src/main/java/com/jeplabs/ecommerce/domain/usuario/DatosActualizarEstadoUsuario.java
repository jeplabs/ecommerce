package com.jeplabs.ecommerce.domain.usuario;

import jakarta.validation.constraints.NotNull;

// DTO para actualizar el estado de un usuario (activo/desactivo)
public record DatosActualizarEstadoUsuario(
        @NotNull(message = "El estado es obligatorio")
        boolean activo
) {}