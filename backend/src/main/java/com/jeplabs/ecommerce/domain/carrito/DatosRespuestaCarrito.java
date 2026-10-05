package com.jeplabs.ecommerce.domain.carrito;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DatosRespuestaCarrito(
        Long id,
        EstadoCarrito estado,
        LocalDateTime expiraAt,
        List<DatosRespuestaCarritoItem> items,
        BigDecimal total,
        int totalItems,
        DatosExpiracionCarrito expiracion
) {
    public DatosRespuestaCarrito(Carrito carrito) {
        this(carrito, null);
    }

    public DatosRespuestaCarrito(Carrito carrito, DatosExpiracionCarrito expiracion) {
        this(
                carrito.getId(),
                carrito.getEstado(),
                carrito.getExpiraAt(),
                carrito.getItems().stream()
                        .map(DatosRespuestaCarritoItem::new)
                        .toList(),
                carrito.getItems().stream()
                        .map(CarritoItem::calcularSubtotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add),
                carrito.getItems().stream()
                        .mapToInt(CarritoItem::getCantidad)
                        .sum(),
                expiracion
        );
    }
}