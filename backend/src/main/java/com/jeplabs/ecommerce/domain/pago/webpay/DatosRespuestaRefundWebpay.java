package com.jeplabs.ecommerce.domain.pago.webpay;

public record DatosRespuestaRefundWebpay(
        Long ordenId,
        EstadoWebpayTransaccion estado
) {
}
