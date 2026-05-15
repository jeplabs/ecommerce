package com.jeplabs.ecommerce.domain.orden;

import jakarta.validation.constraints.NotNull;

public record DatosCrearOrden(

        @NotNull(message = "La dirección de envío es obligatoria")
        Long direccionId,

        String notas
) {}
