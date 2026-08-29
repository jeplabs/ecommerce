package com.jeplabs.ecommerce.domain.favorito;

import com.jeplabs.ecommerce.domain.producto.PrecioHistorial;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoImagen;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO diseñado para acoplarse con la interfaz FavoriteProduct del frontend
public record DatosRespuestaFavorito(
        Long productId,
        String slug,
        String nombre,
        BigDecimal precioVenta,
        String moneda,
        String imagenUrl,
        LocalDateTime guardadoAt
) {
    public DatosRespuestaFavorito(Favorito favorito) {
        this(
                favorito.getProducto().getId(),
                favorito.getProducto().getSlug(),
                favorito.getProducto().getNombre(),
                precioActual(favorito.getProducto()),
                monedaActual(favorito.getProducto()),
                imagenPrincipal(favorito.getProducto()),
                favorito.getCreadoAt()
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
                .orElse("CLP");
    }

    private static String imagenPrincipal(Producto producto) {
        return producto.getImagenes().stream()
                .filter(ProductoImagen::isPrincipal)
                .findFirst()
                .map(ProductoImagen::getUrl)
                .orElse(null);
    }
}
