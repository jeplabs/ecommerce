package com.jeplabs.ecommerce.infra.exceptions;

// Se lanza cuando el cliente no tiene un carrito activo

public class CarritoNoEncontradoException extends RuntimeException {
  public CarritoNoEncontradoException() {
    super("No tienes un carrito activo");
  }
}
