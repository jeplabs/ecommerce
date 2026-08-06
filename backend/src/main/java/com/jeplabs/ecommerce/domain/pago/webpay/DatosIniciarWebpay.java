package com.jeplabs.ecommerce.domain.pago.webpay;

import jakarta.validation.constraints.NotNull;

// Solo recibe el ID de la orden, el monto siempre viene de la BD
public record DatosIniciarWebpay(
        @NotNull(message = "El ID de la orden es obligatorio")
        Long ordenId
) {}
