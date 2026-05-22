package com.jeplabs.ecommerce.domain.envio;

import com.jeplabs.ecommerce.domain.orden.FormaPago;

import java.math.BigDecimal;

public record DatosRespuestaServicioEnvio(
        Long id,
        String nombre,
        String descripcion,
        BigDecimal tarifa,
        BigDecimal recargoContraEntrega,
        BigDecimal costoEnLinea,
        BigDecimal costoContraEntrega,
        String logoUrl
) {
    public DatosRespuestaServicioEnvio(ServicioEnvio servicio) {
        this(
                servicio.getId(),
                servicio.getNombre(),
                servicio.getDescripcion(),
                servicio.getTarifa(),
                servicio.getRecargoContraEntrega(),
                servicio.calcularCostoTotal(FormaPago.EN_LINEA),
                servicio.calcularCostoTotal(FormaPago.CONTRA_ENTREGA),
                servicio.getLogoUrl()
        );
    }
}