package com.jeplabs.ecommerce.dto;

import lombok.Data;

@Data // Genera getters, setters, toString, equals y hashCode
public class RegisterRequest {

    private String email;
    private String password;
    private String role;
}