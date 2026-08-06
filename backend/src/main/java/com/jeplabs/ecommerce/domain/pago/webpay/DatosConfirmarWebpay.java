package com.jeplabs.ecommerce.domain.pago.webpay;

// token_ws puede venir por body o query param
public record DatosConfirmarWebpay(
        String token_ws   // null si viene por query param
) {}
