package com.jeplabs.ecommerce.infra.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

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
}