package com.jeplabs.ecommerce.domain.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// DTO de login
public record DatosLogin(

        @NotBlank @Email
        String email,

        @NotBlank
        String password
) {}