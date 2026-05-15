package com.jeplabs.ecommerce.domain.orden;

public record DatosRespuestaDireccionOrden(
        String alias,
        String calle,
        String ciudad,
        String estado,
        String codigoPostal,
        String pais,
        String telefono,
        String referencias
) {
    public DatosRespuestaDireccionOrden(Orden orden) {
        this(
                orden.getDireccionAlias(),
                orden.getDireccionCalle(),
                orden.getDireccionCiudad(),
                orden.getDireccionEstado(),
                orden.getDireccionCodigoPostal(),
                orden.getDireccionPais(),
                orden.getDireccionTelefono(),
                orden.getDireccionReferencias()
        );
    }
}
