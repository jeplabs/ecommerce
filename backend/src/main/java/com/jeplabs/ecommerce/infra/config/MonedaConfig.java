package com.jeplabs.ecommerce.infra.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Configuration
@Getter
public class MonedaConfig {

    @Value("${api.moneda.codigo}")
    private String codigo;

    @Value("${api.moneda.simbolo}")
    private String simbolo;

    @Value("${api.moneda.nombre}")
    private String nombre;

    @Value("${api.moneda.locale}")
    private String locale;

    @Value("${api.moneda.decimales}")
    private int decimales;

    public BigDecimal normalizarMonto(BigDecimal monto) {
        if (monto == null) {
            return BigDecimal.ZERO.setScale(decimales, RoundingMode.HALF_UP);
        }
        return monto.setScale(decimales, RoundingMode.HALF_UP);
    }

    public boolean esSinDecimales() {
        return decimales == 0;
    }
}