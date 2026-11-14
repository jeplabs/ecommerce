package com.jeplabs.ecommerce.domain.pago.qpaypro;

public record DatosEstadoQPayPro(
        Long ordenId,
        EstadoQPayPro estado,
        String transactionId
) {}
