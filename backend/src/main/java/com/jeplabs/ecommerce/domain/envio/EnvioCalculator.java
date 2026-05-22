package com.jeplabs.ecommerce.domain.envio;

import com.jeplabs.ecommerce.domain.orden.FormaPago;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EnvioCalculator {

    @Value("${api.envio.monto-minimo-gratis}")
    private BigDecimal montoMinimoGratis;

    // Verifica si el subtotal califica para envío gratis
    public boolean aplicaEnvioGratis(BigDecimal subtotal) {
        return subtotal.compareTo(montoMinimoGratis) >= 0;
    }

    // Calcula el costo de envío considerando envío gratis
    public BigDecimal calcularCostoEnvio(BigDecimal subtotal,
                                         ServicioEnvio servicio,
                                         FormaPago formaPago) {
        if (aplicaEnvioGratis(subtotal)) {
            return BigDecimal.ZERO;
        }
        return servicio.calcularCostoTotal(formaPago);
    }

    public BigDecimal getMontoMinimoGratis() {
        return montoMinimoGratis;
    }
}