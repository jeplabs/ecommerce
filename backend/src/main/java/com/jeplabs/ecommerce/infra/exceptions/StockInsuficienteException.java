package com.jeplabs.ecommerce.infra.exceptions;

// Se lanza cuando no hay suficiente stock para completar la orden

public class StockInsuficienteException extends RuntimeException {
  public StockInsuficienteException(String nombreProducto, Integer stockDisponible) {
    super("Stock insuficiente para: " + nombreProducto +
            ". Stock disponible: " + stockDisponible);
  }
}