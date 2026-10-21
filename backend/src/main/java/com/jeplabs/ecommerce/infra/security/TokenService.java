package com.jeplabs.ecommerce.infra.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.jeplabs.ecommerce.domain.usuario.Rol;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

// Genera y valida JWT (Access Token)
@Service
public class TokenService {

    // Secret, redirige a application.properties
    @Value("${api.security.secret}")
    private String secret;

    // Llama al tiempo de validez general del token (fallback)
    @Value("${api.security.expiration:900}")
    private long expirationSeconds;

    @Value("${api.security.access-expiration-cliente-seconds:0}")
    private long expirationClienteSeconds;

    @Value("${api.security.access-expiration-admin-seconds:0}")
    private long expirationAdminSeconds;

    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();
        long segundosValidez = resolverSegundosExpiracion(usuario);

        return JWT.create()
                .withIssuer("jpelabs-ecommerce")
                .withJWTId(UUID.randomUUID().toString())
                .withSubject(usuario.getEmail())
                .withClaim("rol", usuario.getRol().name())
                .withIssuedAt(ahora)
                .withExpiresAt(ahora.plus(segundosValidez, ChronoUnit.SECONDS))
                .sign(Algorithm.HMAC256(secret));
    }

    public long resolverSegundosExpiracion(Usuario usuario) {
        if (usuario != null && usuario.getRol() == Rol.ROLE_ADMIN && expirationAdminSeconds > 0) {
            return expirationAdminSeconds;
        }
        if (usuario != null && usuario.getRol() == Rol.ROLE_CUSTOMER && expirationClienteSeconds > 0) {
            return expirationClienteSeconds;
        }
        return expirationSeconds > 0 ? expirationSeconds : 900L;
    }

    public String getSubject(String token) {
        try {
            return JWT.require(Algorithm.HMAC256(secret))
                    .withIssuer("jpelabs-ecommerce")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            throw new RuntimeException("Token inválido o expirado");
        }
    }
}
