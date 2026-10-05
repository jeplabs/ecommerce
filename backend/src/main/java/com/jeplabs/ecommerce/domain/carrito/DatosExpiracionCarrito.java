package com.jeplabs.ecommerce.domain.carrito;

import java.time.LocalDateTime;

public record DatosExpiracionCarrito(
        LocalDateTime expiraAt,
        long segundosRestantes,
        long ttlTotalSegundos,
        long avisoSegundosAntes,
        boolean carritoAnteriorExpirado
) {
    public DatosExpiracionCarrito(Carrito carrito, long expiracionMinutos, long notificacionMinutosAntes, boolean carritoAnteriorExpirado) {
        this(
                carrito.getExpiraAt(),
                carrito.segundosRestantes(),
                expiracionMinutos * 60L,
                notificacionMinutosAntes * 60L,
                carritoAnteriorExpirado
        );
    }
}
