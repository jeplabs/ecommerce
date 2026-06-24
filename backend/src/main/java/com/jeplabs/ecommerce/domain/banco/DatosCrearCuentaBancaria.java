package com.jeplabs.ecommerce.domain.banco;

import jakarta.validation.constraints.*;

public record DatosCrearCuentaBancaria(

        @NotBlank(message = "El banco es obligatorio")
        String banco,

        @NotBlank(message = "El titular es obligatorio")
        String titular,

        @NotBlank(message = "El tipo de cuenta es obligatorio")
        String tipoCuenta,

        @NotBlank(message = "El número de cuenta es obligatorio")
        String numeroCuenta,

        @NotBlank(message = "La moneda es obligatoria")
        String moneda,

        @NotNull(message = "El orden de visualización es obligatorio")
        @Min(value = 1, message = "El orden mínimo es 1")
        @Max(value = 3, message = "Solo se permiten máximo 3 cuentas visibles")
        Integer ordenVisualizacion
) {}