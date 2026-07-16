package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.pago.TipoMetodoPago;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DatosRespuestaOrden(
        Long id,
        EstadoOrden estado,
        Long direccionId, // null si la dirección fue eliminada
        DatosRespuestaDireccionOrden direccionEnvio,
        String servicioEnvio,       //  nombre del servicio
        FormaPagoEnvio formaPagoEnvio,        // forma de pago
        String metodoPago,              // ← código del método
        String metodoPagoNombre,        // ← nombre legible
        TipoMetodoPago tipoMetodoPago,  // ← tipo para lógica en frontend
        List<DatosRespuestaOrdenItem> items,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal costoEnvio,      // costo de envío
        String notaEnvio,
        BigDecimal total,
        String comprobanteUrl,          // ← nuevo
        String comprobanteNombre,       // ← nuevo
        LocalDateTime comprobanteFecha, //
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
                orden.getFormaPagoEnvio(),
                orden.getMetodoPagoCodigo(),
                orden.getMetodoPago() != null ? orden.getMetodoPago().getNombre() : null,
                orden.getTipoMetodoPago(),
                orden.getItems().stream()
                        .map(DatosRespuestaOrdenItem::new)
                        .toList(),
                orden.getSubtotal(),
                orden.getIva(),
                orden.getCostoEnvio(),
                orden.getNotaEnvio(),
                orden.getTotal(),
                orden.getComprobanteUrl(),      // ← nuevo
                orden.getComprobanteNombre(),   // ← nuevo
                orden.getComprobanteFecha(),    // ← nuevo
                orden.getNotas(),
                orden.getCreadoAt(),
                orden.getActualizadoAt()
        );
    }
}