package com.jeplabs.ecommerce.domain.pago.webpay;

import com.jeplabs.ecommerce.domain.orden.DatosRespuestaOrden;

// Respuesta completa al frontend
public record DatosRespuestaConfirmarWebpay(
        boolean success,
        DatosRespuestaOrden orden,    // null si fallo
        DatosPagoWebpay payment,      // null si fallo
        String error,                 // null si éxito
        MotivoRechazoWebpay motivo    // null si éxito
) {
    // Constructor éxito
    public static DatosRespuestaConfirmarWebpay exitoso(DatosRespuestaOrden orden,
                                                        DatosPagoWebpay payment) {
        return new DatosRespuestaConfirmarWebpay(true, orden, payment, null, null);
    }

    // Constructor fallo
    public static DatosRespuestaConfirmarWebpay fallido(String error,
                                                        MotivoRechazoWebpay motivo) {
        return new DatosRespuestaConfirmarWebpay(false, null, null, error, motivo);
    }
}
