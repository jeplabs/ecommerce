package com.jeplabs.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // Constructor con todos los campos para retornar la respuesta fácilmente
public class AuthResponse {

    private String message;
    private String email;
    private String role;
}