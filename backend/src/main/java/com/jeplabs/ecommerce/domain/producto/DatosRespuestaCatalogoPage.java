package com.jeplabs.ecommerce.domain.producto;

import java.util.List;
import java.util.Map;

public record DatosRespuestaCatalogoPage(
        List<DatosRespuestaProducto> content,
        int number,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        Map<String, List<DatosRespuestaFaceta>> facets
) {}
