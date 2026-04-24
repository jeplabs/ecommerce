package com.jeplabs.ecommerce.domain.carrito;

import java.math.BigDecimal;
import java.util.List;

public record DatosRespuestaCarrito(
        Long id,
        EstadoCarrito estado,
        List<DatosRespuestaCarritoItem> items,
        BigDecimal total,
        int totalItems
) {
    public DatosRespuestaCarrito(Carrito carrito) {
        this(
                carrito.getId(),
                carrito.getEstado(),
                carrito.getItems().stream()
                        .map(DatosRespuestaCarritoItem::new)
                        .toList(),
                carrito.getItems().stream()
                        .map(CarritoItem::calcularSubtotal)
                        .reduce(BigDecimal.ZERO, BigDecimal::add),
                carrito.getItems().stream()
                        .mapToInt(CarritoItem::getCantidad)
                        .sum()
        );
    }
}