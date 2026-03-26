package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// Respuesta pública, no incluye precio de costo ni margen.
// El precio actual se obtiene del historial donde fechaFin es null.
public record DatosRespuestaProducto(
        Long id,
        String sku,
        String nombre,
        String slug,
        String descripcion,
        Map<String, Object> specs,
        Integer stock,
        EstadoProducto estado,
        BigDecimal precioVenta,
        String moneda,
        List<String> imagenesUrl,
        List<DatosRespuestaCategoria> categorias,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    // Constructor
    public DatosRespuestaProducto(Producto producto) {
        this(
                producto.getId(),
                producto.getSku(),
                producto.getNombre(),
                producto.getSlug(),
                producto.getDescripcion(),
                producto.getSpecs(),
                producto.getStock(),
                producto.getEstado(),
                precioActual(producto),
                monedaActual(producto),
                producto.getImagenes()
                        .stream()
                        .map(ProductoImagen::getUrl)
                        .toList(),
                // Mapeo de categorías
                producto.getCategorias()
                        .stream()
                        .map(DatosRespuestaCategoria::new)
                        .toList(),
                producto.getCreatedAt(),
                producto.getUpdatedAt()
        );
    }

    private static BigDecimal precioActual(Producto producto) {
        return producto.getPrecios().stream()
                .filter(p -> p.getFechaFin() == null)
                .findFirst()
                .map(PrecioHistorial::getPrecioVenta)
                .orElse(BigDecimal.ZERO);
    }

    private static String monedaActual(Producto producto) {
        return producto.getPrecios().stream()
                .filter(p -> p.getFechaFin() == null)
                .findFirst()
                .map(PrecioHistorial::getMoneda)
                .orElse("USD");
    }
}
