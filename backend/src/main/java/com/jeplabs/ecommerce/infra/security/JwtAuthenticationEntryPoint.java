package com.jeplabs.ecommerce.infra.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

// Esta clase se activa cuando el token es inválido, expirado o no existe
// Se usan en SecurityConfigurations.java
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        String mensaje = "Token inválido o expirado";

        // Distinguir si no envió token o si el token es malo
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            mensaje = "Acceso denegado: se requiere autenticación";
        }

        response.getWriter().write(
                new ObjectMapper().writeValueAsString(Map.of("error", mensaje))
        );
    }
}
