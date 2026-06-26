package com.jeplabs.ecommerce.domain.pago;

import java.util.Map;

public record DatosRespuestaMetodoPago(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        TipoMetodoPago tipo,
        boolean activo,
        Integer ordenVisualizacion,
        Map<String, Object> configuracion
) {
    public DatosRespuestaMetodoPago(MetodoPago metodo) {
        this(
                metodo.getId(),
                metodo.getCodigo(),
                metodo.getNombre(),
                metodo.getDescripcion(),
                metodo.getTipo(),
                metodo.isActivo(),
                metodo.getOrdenVisualizacion(),
                metodo.getConfiguracion()
        );
    }
}