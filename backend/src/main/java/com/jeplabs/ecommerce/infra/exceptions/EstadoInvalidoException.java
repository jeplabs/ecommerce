package com.jeplabs.ecommerce.infra.exceptions;

// Se lanza cuando se intenta una transición de estado no permitida

public class EstadoInvalidoException extends RuntimeException {
    public EstadoInvalidoException(String estadoActual, String estadoNuevo) {
        super("No se puede cambiar de " + estadoActual + " a " + estadoNuevo);
    }
}