package com.jeplabs.ecommerce.infra.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

// Genera y valida JWT
@Service
public class TokenService {

    // Secret, redirige a application.propierties
    @Value("${api.security.secret}")
    private String secret;

    // Llama al tiempo de validez del token
    @Value("${api.security.expiration}")
    private long expirationSeconds;

    public String generarToken(Usuario usuario) {
        return JWT.create()
                .withIssuer("jpelabs-ecommerce")
                .withSubject(usuario.getEmail())
                .withClaim("rol", usuario.getRol().name())
                .withExpiresAt(Instant.now().plus(expirationSeconds, ChronoUnit.SECONDS))
                .sign(Algorithm.HMAC256(secret));
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