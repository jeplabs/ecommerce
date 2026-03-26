package com.jeplabs.ecommerce.domain.producto;

import java.math.BigDecimal;

// Respuesta exclusiva para admin que incluye precio de costo y margen calculado.
public record DatosRespuestaProductoAdmin(
        Long id,
        String sku,
        String nombre,
        String slug,
        Integer stock,
        EstadoProducto estado,
        BigDecimal precioVenta,
        BigDecimal precioCosto,
        BigDecimal margenPorcentaje,
        String moneda
) {
    public DatosRespuestaProductoAdmin(Producto producto) {
        this(
                producto.getId(),
                producto.getSku(),
                producto.getNombre(),
                producto.getSlug(),
                producto.getStock(),
                producto.getEstado(),
                precioActual(producto).getPrecioVenta(),
                precioActual(producto).getPrecioCosto(),
                precioActual(producto).calcularMargen(),
                precioActual(producto).getMoneda()
        );
    }

    private static PrecioHistorial precioActual(Producto producto) {
        return producto.getPrecios().stream()
                .filter(p -> p.getFechaFin() == null)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Producto sin precio activo"));
    }
}
