package com.jeplabs.ecommerce.domain.usuario;

import com.jeplabs.ecommerce.infra.validation.PasswordMatch;
import com.jeplabs.ecommerce.infra.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@PasswordMatch
public record DatosResetPassword(

        @NotBlank(message = "El token es obligatorio")
        String token,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @ValidPassword
        String password,

        @NotBlank(message = "Debes confirmar la contraseña")
        String confirmarPassword
) implements ConConfirmacionPassword {}