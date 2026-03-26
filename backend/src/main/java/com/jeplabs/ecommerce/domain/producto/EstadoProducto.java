package com.jeplabs.ecommerce.domain.producto;

public enum EstadoProducto {
    DISPONIBLE,
    SIN_STOCK,
    OCULTO,
    DESCONTINUADO;

    // Define qué estados son visibles para el cliente
    public boolean esVisibleParaCliente() {
        return this == DISPONIBLE || this == SIN_STOCK;
    }

    // Define qué estados permiten agregar al carrito
    public boolean esComprable() {
        return this == DISPONIBLE;
    }
}
