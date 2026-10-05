package com.jeplabs.ecommerce.infra.exceptions;

public class CarritoExpiradoException extends RuntimeException {
    public CarritoExpiradoException() {
        super("Tu carrito ha expirado por inactividad. Puedes iniciar uno nuevo o restaurar tus productos.");
    }

    public CarritoExpiradoException(String mensaje) {
        super(mensaje);
    }
}
