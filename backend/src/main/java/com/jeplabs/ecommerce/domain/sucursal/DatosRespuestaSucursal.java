package com.jeplabs.ecommerce.domain.sucursal;

import java.time.LocalDateTime;

public record DatosRespuestaSucursal(
        Long id,
        String nombre,
        String direccion,
        String ciudad,
        String estado,
        String codigoPostal,
        String pais,
        String telefono,
        String horario,
        String referencias,
        String mapaUrl,
        boolean activo,
        Integer ordenVisualizacion,
        LocalDateTime creadoAt,
        LocalDateTime actualizadoAt
) {
    public DatosRespuestaSucursal(Sucursal sucursal) {
        this(
                sucursal.getId(),
                sucursal.getNombre(),
                sucursal.getDireccion(),
                sucursal.getCiudad(),
                sucursal.getEstado(),
                sucursal.getCodigoPostal(),
                sucursal.getPais(),
                sucursal.getTelefono(),
                sucursal.getHorario(),
                sucursal.getReferencias(),
                sucursal.getMapaUrl(),
                sucursal.isActivo(),
                sucursal.getOrdenVisualizacion(),
                sucursal.getCreadoAt(),
                sucursal.getActualizadoAt()
        );
    }
}
