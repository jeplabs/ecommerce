package com.jeplabs.ecommerce.domain.orden;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DatosRespuestaOrden(
        Long id,
        EstadoOrden estado,
        Long direccionId, // null si la dirección fue eliminada
        DatosRespuestaDireccionOrden direccionEnvio,
        String servicioEnvio,       //  nombre del servicio
        FormaPago formaPago,        // forma de pago
        List<DatosRespuestaOrdenItem> items,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal costoEnvio,      // costo de envío
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
                orden.getServicioEnvio() != null ? orden.getServicioEnvio().getNombre() : null,
                orden.getFormaPago(),
                orden.getItems().stream()
                        .map(DatosRespuestaOrdenItem::new)
                        .toList(),
                orden.getSubtotal(),
                orden.getIva(),
                orden.getCostoEnvio(),
                orden.getTotal(),
                orden.getNotas(),
                orden.getCreadoAt(),
                orden.getActualizadoAt()
        );
    }
}