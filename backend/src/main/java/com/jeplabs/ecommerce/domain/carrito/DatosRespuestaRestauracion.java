package com.jeplabs.ecommerce.domain.carrito;

import java.util.List;

public record DatosRespuestaRestauracion(
        DatosRespuestaCarrito carrito,
        List<ItemNoRestaurado> itemsNoRestaurados
) {
    public record ItemNoRestaurado(
            Long productoId,
            String nombre,
            String motivo,
            Integer cantidadSolicitada,
            Integer cantidadRestaurada
    ) {}
}
