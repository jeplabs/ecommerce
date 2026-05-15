package com.jeplabs.ecommerce.domain.orden;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class IvaCalculator {

    @Value("${api.impuestos.iva}")
    private BigDecimal porcentajeIva;

    // Extrae el IVA de un precio que ya lo incluye
    // Ejemplo: Q150.95 → IVA = Q150.95 - (Q150.95 / 1.12) = Q16.17
    public BigDecimal extraerIva(BigDecimal precioConIva) {
        BigDecimal precioBase = extraerPrecioBase(precioConIva);
        return precioConIva.subtract(precioBase)
                .setScale(2, RoundingMode.HALF_UP);
    }

    // Extrae el precio base sin IVA
    // Ejemplo: Q150.95 / 1.12 = Q134.78
    public BigDecimal extraerPrecioBase(BigDecimal precioConIva) {
        return precioConIva
                .divide(BigDecimal.ONE.add(porcentajeIva), 2, RoundingMode.HALF_UP);
    }

    // Calcula el IVA total de un subtotal
    public BigDecimal calcularIvaTotal(BigDecimal subtotal) {
        return extraerIva(subtotal);
    }
}