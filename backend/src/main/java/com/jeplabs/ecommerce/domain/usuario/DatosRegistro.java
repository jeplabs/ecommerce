package com.jeplabs.ecommerce.domain.usuario;

import com.jeplabs.ecommerce.infra.validation.PasswordMatch;
import com.jeplabs.ecommerce.infra.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// DTO que recibe los datos del cliente cuando se registra.
// Las que comienzan con @ son anotaciones de validación.
@PasswordMatch // personalizada, para confirmar password.
public record DatosRegistro(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(min = 2, max = 100, message = "El apellido debe tener entre 2 y 100 caracteres")
        String apellido,

        @NotBlank(message = "El pais es obligatorio")
        @Size(min = 2, max = 100, message = "El país debe tener entre 2 y 100 caracteres")
        String pais,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "Formato de email inválido")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @ValidPassword // personalizado
        String password,

        @NotBlank(message = "Debes confirmar la contraseña")
        String confirmarPassword
) {}