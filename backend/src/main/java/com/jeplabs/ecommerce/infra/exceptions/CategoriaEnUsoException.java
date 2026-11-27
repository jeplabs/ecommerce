package com.jeplabs.ecommerce.infra.exceptions;

import lombok.Getter;

@Getter
public class CategoriaEnUsoException extends RuntimeException {

    public static final String CODIGO_CON_SUBCATEGORIAS = "CATEGORIA_CON_SUBCATEGORIAS";
    public static final String CODIGO_CON_PRODUCTOS = "CATEGORIA_CON_PRODUCTOS";

    private final String codigo;

    public CategoriaEnUsoException(String mensaje, String codigo) {
        super(mensaje);
        this.codigo = codigo;
    }
}
