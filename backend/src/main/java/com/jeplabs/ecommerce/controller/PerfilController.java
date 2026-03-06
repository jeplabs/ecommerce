package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.usuario.AutenticacionService;
import com.jeplabs.ecommerce.domain.usuario.DatosActualizarPerfil;
import com.jeplabs.ecommerce.domain.usuario.DatosRespuestaUsuario;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Maneja datos del usuario autenticado. El email del usuario se obtiene del token
// mediante Authentication que Spring inyecta automáticamente.
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class PerfilController {

    private final AutenticacionService service;

    // GET /api/usuarios/perfil
    // Endpoint para entrar a perfil de usuario
    @GetMapping("/perfil")
    public ResponseEntity<DatosRespuestaUsuario> verPerfil(Authentication authentication) {
        String email = authentication.getName(); // extrae el email del token
        return ResponseEntity.ok(service.verPerfil(email));
    }

    // PATCH /api/usuarios/perfil
    // Endpoint para actualizar perfil de usuario
    @PatchMapping("/perfil")
    public ResponseEntity<DatosRespuestaUsuario> actualizarPerfil(
            Authentication authentication,
            @RequestBody @Valid DatosActualizarPerfil datos) {
        String email = authentication.getName(); // extrae el email del token
        return ResponseEntity.ok(service.actualizarPerfil(email, datos));
    }
}
