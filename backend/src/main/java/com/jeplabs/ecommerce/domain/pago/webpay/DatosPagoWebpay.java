package com.jeplabs.ecommerce.domain.pago.webpay;

import java.math.BigDecimal;

// Datos del pago aprobado para la respuesta
public record DatosPagoWebpay(
        String transactionId,
        String authorizationCode,
        BigDecimal amount,
        String cardNumber,
        String paymentTypeCode,
        Byte installments
) {}
