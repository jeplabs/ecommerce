package com.jeplabs.ecommerce.infra.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// Este es el validador de la anotación @ValidPassoword
public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Al menos: 1 mayúscula, 1 número, 1 carácter especial, mínimo 8 caracteres
    private static final String REGEX = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$";

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) return false;
        return password.matches(REGEX);
    }

}
