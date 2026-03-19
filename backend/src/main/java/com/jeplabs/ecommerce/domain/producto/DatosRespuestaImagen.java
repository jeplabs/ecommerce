package com.jeplabs.ecommerce.domain.producto;

//Devuelve los datos de una imagen individual.

public record DatosRespuestaImagen(
        Long id,
        String url,
        boolean principal
) {
    public DatosRespuestaImagen(ProductoImagen imagen) {
        this(imagen.getId(), imagen.getUrl(), imagen.isPrincipal());
    }
}