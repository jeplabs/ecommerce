package com.jeplabs.ecommerce.domain.direccion;

// Respuesta completa de una direccion
public record DatosRespuestaDireccion(
        Long id,
        String alias,
        String calle,
        String ciudad,
        String estado,
        String codigoPostal,
        String pais,
        String telefono,
        String referencias,
        boolean principal,
        boolean activo
) {
    public DatosRespuestaDireccion(Direccion direccion) {
        this(
                direccion.getId(),
                direccion.getAlias(),
                direccion.getCalle(),
                direccion.getCiudad(),
                direccion.getEstado(),
                direccion.getCodigoPostal(),
                direccion.getPais(),
                direccion.getTelefono(),
                direccion.getReferencias(),
                direccion.isPrincipal(),
                direccion.isActivo()
        );
    }
}