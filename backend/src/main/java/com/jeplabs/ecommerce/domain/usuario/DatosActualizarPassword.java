package com.jeplabs.ecommerce.domain.usuario;

import com.jeplabs.ecommerce.infra.validation.PasswordMatch;
import com.jeplabs.ecommerce.infra.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@PasswordMatch
public record DatosActualizarPassword(

        @NotBlank(message = "La contraseña actual es obligatoria")
        String passwordActual,

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @ValidPassword
        String password,

        @NotBlank(message = "Debes confirmar la nueva contraseña")
        String confirmarPassword

) implements ConConfirmacionPassword {}