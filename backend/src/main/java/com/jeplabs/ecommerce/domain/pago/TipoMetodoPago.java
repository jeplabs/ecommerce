package com.jeplabs.ecommerce.domain.pago;

public enum TipoMetodoPago {
    PASARELA,       // Stripe, Mercado Pago, Webpay, etc.
    TRANSFERENCIA,  // Transferencia bancaria con comprobante
    CONTRA_ENTREGA  // Sin pago inmediato
}