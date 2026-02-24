package com.jeplabs.ecommerce.domain.usuario;

import jakarta.validation.constraints.NotNull;

public record DatosActualizarRol(
        @NotNull(message = "El rol es obligatorio")
        Rol rol
) {}