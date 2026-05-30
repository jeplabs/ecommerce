package com.jeplabs.ecommerce.infra.exceptions;

// Se lanza cuando el cliente intenta crear una orden con el carrito vacío.

public class CarritoVacioException extends RuntimeException {
    public CarritoVacioException() {
        super("Tu carrito está vacío");
    }
}
