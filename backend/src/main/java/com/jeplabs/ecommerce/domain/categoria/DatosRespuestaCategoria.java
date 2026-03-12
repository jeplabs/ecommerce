package com.jeplabs.ecommerce.domain.categoria;

import java.util.List;

// Devuelve la categoría en formato árbol anidado. Las subcategorías se incluyen recursivamente
// en el mismo DTO, lo que permite devolver toda la jerarquía en una sola respuesta.
public record DatosRespuestaCategoria(
        Long id,
        String nombre,
        String slug,
        Long parentId,
        List<DatosRespuestaCategoria> subcategorias
) {
    public DatosRespuestaCategoria(Categoria categoria) {
        this(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getSlug(),
                categoria.getParent() != null ? categoria.getParent().getId() : null,
                categoria.getSubcategorias()
                        .stream()
                        .map(DatosRespuestaCategoria::new)
                        .toList()
        );
    }
}
