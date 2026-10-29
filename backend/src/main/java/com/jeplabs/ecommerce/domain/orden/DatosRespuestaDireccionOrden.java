package com.jeplabs.ecommerce.domain.orden;

public record DatosRespuestaDireccionOrden(
        String alias,
        String calle,
        String ciudad,
        String estado,
        String codigoPostal,
        String pais,
        String telefono,
        String referencias,
        String horario
) {
    public DatosRespuestaDireccionOrden(
            String alias,
            String calle,
            String ciudad,
            String estado,
            String codigoPostal,
            String pais,
            String telefono,
            String referencias
    ) {
        this(alias, calle, ciudad, estado, codigoPostal, pais, telefono, referencias, null);
    }

    public DatosRespuestaDireccionOrden(Orden orden) {
        this(
                orden.getDireccionAlias(),
                orden.getDireccionCalle(),
                orden.getDireccionCiudad(),
                orden.getDireccionEstado(),
                orden.getDireccionCodigoPostal(),
                orden.getDireccionPais(),
                orden.getDireccionTelefono(),
                orden.getDireccionReferencias(),
                orden.getSucursalHorario()
        );
    }
}
