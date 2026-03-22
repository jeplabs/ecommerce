package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

// DTO específico para el precio, reutilizable tanto al crear como al actualizar precios.
public record DatosPrecio(

        @NotNull(message = "El precio de venta es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de venta debe ser mayor a 0")
        BigDecimal precioVenta,

        @NotNull(message = "El precio de costo es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de costo debe ser mayor a 0")
        BigDecimal precioCosto,

        @NotBlank(message = "La moneda es obligatoria")
        String moneda
) {}
