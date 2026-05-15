package com.jeplabs.ecommerce.domain.orden;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DatosRespuestaOrden(
        Long id,
        EstadoOrden estado,
        Long direccionId, // null si la dirección fue eliminada
        DatosRespuestaDireccionOrden direccionEnvio,
        List<DatosRespuestaOrdenItem> items,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal total,
        String notas,
        LocalDateTime creadoAt,
        LocalDateTime actualizadoAt
) {
    public DatosRespuestaOrden(Orden orden) {
        this(
                orden.getId(),
                orden.getEstado(),
                orden.getDireccion() != null ? orden.getDireccion().getId() : null,
                new DatosRespuestaDireccionOrden(orden),
                orden.getItems().stream()
                        .map(DatosRespuestaOrdenItem::new)
                        .toList(),
                orden.getSubtotal(),
                orden.getIva(),
                orden.getTotal(),
                orden.getNotas(),
                orden.getCreadoAt(),
                orden.getActualizadoAt()
        );
    }
}