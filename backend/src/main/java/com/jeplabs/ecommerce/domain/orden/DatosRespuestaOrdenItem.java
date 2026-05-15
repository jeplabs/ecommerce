package com.jeplabs.ecommerce.domain.orden;

import java.math.BigDecimal;

public record DatosRespuestaOrdenItem(
        Long id,
        Long productoId,
        String sku,
        String nombreProducto,
        Integer cantidad,
        BigDecimal precioUnitario,  // con IVA incluido
        BigDecimal precioBase,      // sin IVA
        BigDecimal ivaUnitario,     // IVA por unidad
        BigDecimal subtotal
) {
    public DatosRespuestaOrdenItem(OrdenItem item) {
        this(
                item.getId(),
                item.getProducto().getId(),
                item.getSku(),
                item.getNombreProducto(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getPrecioBase(),
                item.getIvaUnitario(),
                item.getSubtotal()
        );
    }
}