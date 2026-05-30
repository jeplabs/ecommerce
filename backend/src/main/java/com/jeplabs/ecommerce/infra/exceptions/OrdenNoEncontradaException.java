package com.jeplabs.ecommerce.infra.exceptions;

// Se lanza cuando se busca una orden que no existe o no pertenece al usuario.
public class OrdenNoEncontradaException extends RuntimeException {
  public OrdenNoEncontradaException(Long id) {
    super("Orden no encontrada con ID: " + id);
  }
}