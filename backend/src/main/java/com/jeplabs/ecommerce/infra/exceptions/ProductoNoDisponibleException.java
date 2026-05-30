package com.jeplabs.ecommerce.infra.exceptions;

// Se lanza cuando se busca una orden que no existe o no pertenece al usuario

public class ProductoNoDisponibleException extends RuntimeException {
    public ProductoNoDisponibleException(String nombreProducto) {
        super("El producto " + nombreProducto + " ya no está disponible");
    }
}