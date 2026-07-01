package com.jeplabs.ecommerce.infra.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class MonedaFormatter {

    private final MonedaConfig monedaConfig;

    // Formatea un precio con símbolo: Q1,900.00 o $1.900
    public String formatear(BigDecimal monto) {
        if (monto == null) return monedaConfig.getSimbolo() + "0";

        BigDecimal montoRedondeado = monto.setScale(
                monedaConfig.getDecimales(), RoundingMode.HALF_UP);

        NumberFormat formato = NumberFormat.getNumberInstance(
                Locale.forLanguageTag(monedaConfig.getLocale()));
        formato.setMinimumFractionDigits(monedaConfig.getDecimales());
        formato.setMaximumFractionDigits(monedaConfig.getDecimales());

        return monedaConfig.getSimbolo() + formato.format(montoRedondeado);
    }
}