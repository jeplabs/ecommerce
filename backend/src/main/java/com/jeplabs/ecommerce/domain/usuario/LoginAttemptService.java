package com.jeplabs.ecommerce.domain.usuario;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

// Servicio que verifica los intentos de login contra el email.
@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final UsuarioRepository repositorio;

    @Value("${api.security.lockout-minutes}")
    private long lockoutMinutes; // lee el valor de application.properties

    public void loginFallido(String email) {
        repositorio.findByEmail(email).ifPresent(usuario -> {
            usuario.registrarIntentoFallido();
            repositorio.save(usuario);
        });
    }

    public void loginExitoso(String email) {
        repositorio.findByEmail(email).ifPresent(usuario -> {
            usuario.resetearIntentos();
            repositorio.save(usuario);
        });
    }

    // Verificar y desbloquear automáticamente si pasaron 30 minutos
    public void verificarBloqueoExpirado(String email) {
        repositorio.findByEmail(email).ifPresent(usuario -> {
            if (usuario.isBloqueado() && usuario.bloqueoExpirado(lockoutMinutes)) {
                usuario.resetearIntentos();
                repositorio.save(usuario);
            }
        });
    }
}
