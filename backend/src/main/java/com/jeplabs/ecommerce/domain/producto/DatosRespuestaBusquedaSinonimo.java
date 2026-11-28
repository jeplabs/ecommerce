package com.jeplabs.ecommerce.domain.producto;

import java.time.LocalDateTime;
import java.util.List;

public record DatosRespuestaBusquedaSinonimo(
        Long id,
        String nombreGrupo,
        List<String> terminos,
        boolean activo,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public DatosRespuestaBusquedaSinonimo(BusquedaSinonimo entidad) {
        this(
                entidad.getId(),
                entidad.getNombreGrupo(),
                entidad.obtenerListaTerminos(),
                entidad.isActivo(),
                entidad.getCreatedAt(),
                entidad.getUpdatedAt()
        );
    }
}
