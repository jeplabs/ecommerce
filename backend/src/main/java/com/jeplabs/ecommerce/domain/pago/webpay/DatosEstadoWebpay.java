package com.jeplabs.ecommerce.domain.pago.webpay;

// Estado actual para polling del frontend
public record DatosEstadoWebpay(
        Long ordenId,
        EstadoWebpayTransaccion estado,
        MotivoRechazoWebpay motivo
) {}
