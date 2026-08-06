package com.jeplabs.ecommerce.domain.pago.webpay;

// Lo que necesita el frontend para redirigir.
public record DatosRespuestaIniciarWebpay(
        String token,
        String url
) {}
