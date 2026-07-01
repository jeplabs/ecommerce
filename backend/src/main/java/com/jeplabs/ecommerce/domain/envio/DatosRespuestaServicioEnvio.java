package com.jeplabs.ecommerce.domain.envio;

import com.jeplabs.ecommerce.domain.orden.FormaPagoEnvio;

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
                servicio.calcularCostoTotal(FormaPagoEnvio.EN_LINEA),
                servicio.calcularCostoTotal(FormaPagoEnvio.CONTRA_ENTREGA),
                servicio.getLogoUrl()
        );
    }
}