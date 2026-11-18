package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Respuesta exclusiva para admin que incluye precio de costo y margen calculado.
public record DatosRespuestaProductoAdmin(
        Long id,
        String sku,
        String nombre,
        String slug,
        String descripcion,
        Map<String, Object> specs,
        Integer stock,
        EstadoProducto estado,
        BigDecimal precioVenta,
        BigDecimal precioCosto,
        BigDecimal margenPorcentaje,
        String moneda,
        List<DatosRespuestaImagen> imagenes,
        List<DatosRespuestaCategoria> categorias,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public DatosRespuestaProductoAdmin(Producto producto) {
        this(
                producto.getId(),
                producto.getSku(),
                producto.getNombre(),
                producto.getSlug(),
                producto.getDescripcion(),
                producto.getSpecs(),
                producto.getStock(),
                producto.getEstado(),
                precioActual(producto).getPrecioVenta(),
                precioActual(producto).getPrecioCosto(),
                precioActual(producto).calcularMargen(),
                precioActual(producto).getMoneda(),
                producto.getImagenes()
                        .stream()
                        .map(DatosRespuestaImagen::new)
                        .toList(),
                producto.getCategorias()
                        .stream()
                        .map(DatosRespuestaCategoria::new)
                        .toList(),
                producto.getCreatedAt(),
                producto.getUpdatedAt()
        );
    }

    private static PrecioHistorial precioActual(Producto producto) {
        return producto.getPrecios().stream()
                .filter(p -> p.getFechaFin() == null)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Producto sin precio activo"));
    }
}
