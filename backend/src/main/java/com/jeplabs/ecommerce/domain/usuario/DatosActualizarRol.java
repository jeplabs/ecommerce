package com.jeplabs.ecommerce.domain.usuario;

import jakarta.validation.constraints.NotNull;

// DTO para actualización de rol por parte de un Admin
public record DatosActualizarRol(
        @NotNull(message = "El rol es obligatorio")
        Rol rol
) {}