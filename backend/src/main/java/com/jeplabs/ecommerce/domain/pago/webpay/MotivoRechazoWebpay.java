package com.jeplabs.ecommerce.domain.pago.webpay;

public enum MotivoRechazoWebpay {
    REJECTED, // Tarjeta rechazada por el banco
    ABORTED,  // Usuario canceló en el formulario
    TIMEOUT   // Se agotó el tiempo en Webpay
}
