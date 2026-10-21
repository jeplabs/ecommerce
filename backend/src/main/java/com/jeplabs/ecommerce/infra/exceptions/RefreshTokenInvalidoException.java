package com.jeplabs.ecommerce.infra.exceptions;

public class RefreshTokenInvalidoException extends RuntimeException {

    public RefreshTokenInvalidoException(String message) {
        super(message);
    }
}
