package com.jeplabs.ecommerce.domain.banco;

import jakarta.validation.constraints.*;

public record DatosActualizarCuentaBancaria(
        String banco,
        String titular,
        String tipoCuenta,
        String numeroCuenta,
        String moneda,

        @Min(value = 1, message = "El orden mínimo es 1")
        @Max(value = 3, message = "Solo se permiten máximo 3 cuentas visibles")
        Integer ordenVisualizacion
) {}