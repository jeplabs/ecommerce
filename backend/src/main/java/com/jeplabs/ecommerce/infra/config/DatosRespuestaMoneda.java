package com.jeplabs.ecommerce.infra.config;

public record DatosRespuestaMoneda(
        String codigo,
        String simbolo,
        String nombre,
        String locale,
        int decimales
) {}