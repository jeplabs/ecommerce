package com.jeplabs.ecommerce.domain.carrito;

import java.math.BigDecimal;

public record DatosRespuestaCarritoItem(
        Long id,
        Long productoId,
        String nombreProducto,
        String skuProducto,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal
) {
    public DatosRespuestaCarritoItem(CarritoItem item) {
        this(
                item.getId(),
                item.getProducto().getId(),
                item.getProducto().getNombre(),
                item.getProducto().getSku(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.calcularSubtotal()
        );
    }
}