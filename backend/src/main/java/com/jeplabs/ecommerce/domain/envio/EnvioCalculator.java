package com.jeplabs.ecommerce.domain.envio;

import com.jeplabs.ecommerce.domain.orden.FormaPagoEnvio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EnvioCalculator {

    @Value("${api.envio.monto-minimo-gratis}")
    private BigDecimal montoMinimoGratis;

    public boolean aplicaEnvioGratis(BigDecimal subtotal, ServicioEnvio servicio,
                                     FormaPagoEnvio formaPagoEnvio) {
        // Contra entrega nunca aplica envío gratis
        // Express nunca aplica envío gratis
        // Solo aplica si es pago en línea/transferencia, servicio normal y supera el mínimo
        if (formaPagoEnvio == FormaPagoEnvio.CONTRA_ENTREGA) return false;
        if (servicio.isSinContraEntrega()) return false;
        return subtotal.compareTo(montoMinimoGratis) >= 0;
    }

    public BigDecimal calcularCostoEnvio(BigDecimal subtotal, ServicioEnvio servicio,
                                         FormaPagoEnvio formaPagoEnvio) {
        // Contra entrega → costo cero en el sistema (lo cobra el servicio físicamente)
        if (formaPagoEnvio == FormaPagoEnvio.CONTRA_ENTREGA) {
            return BigDecimal.ZERO;
        }

        // Express → siempre se cobra sin importar el subtotal
        if (servicio.isSinContraEntrega()) {
            return servicio.getTarifa();
        }

        // Normal en línea/transferencia → gratis si supera el mínimo
        if (aplicaEnvioGratis(subtotal, servicio, formaPagoEnvio)) {
            return BigDecimal.ZERO;
        }

        return servicio.getTarifa();
    }

    public BigDecimal getMontoMinimoGratis() {
        return montoMinimoGratis;
    }
}