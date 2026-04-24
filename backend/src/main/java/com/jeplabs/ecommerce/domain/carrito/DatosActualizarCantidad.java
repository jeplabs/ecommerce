package com.jeplabs.ecommerce.domain.carrito;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DatosActualizarCantidad(

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer cantidad
) {}