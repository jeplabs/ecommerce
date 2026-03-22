package com.jeplabs.ecommerce.infra.validation;

import com.jeplabs.ecommerce.domain.usuario.DatosRegistro;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

// Esta es la lógica de validación de coincidencia de password usando PasswordMatch
public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, DatosRegistro> {

    @Override
    public boolean isValid(DatosRegistro datos, ConstraintValidatorContext context) {
        if (datos.password() == null || datos.confirmarPassword() == null) return false;

        boolean coinciden = datos.password().equals(datos.confirmarPassword());

        if (!coinciden) {
            // Apunta el error al campo confirmarPassword, no al record completo
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Las contraseñas no coinciden")
                    .addPropertyNode("confirmarPassword")
                    .addConstraintViolation();
        }

        return coinciden;
    }

}
