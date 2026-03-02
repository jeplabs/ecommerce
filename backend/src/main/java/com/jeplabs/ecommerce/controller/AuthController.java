package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.usuario.AutenticacionService;
import com.jeplabs.ecommerce.domain.usuario.DatosActualizarRol;
import com.jeplabs.ecommerce.domain.usuario.DatosRegistro;
import com.jeplabs.ecommerce.domain.usuario.DatosRespuestaUsuario;
import com.jeplabs.ecommerce.domain.usuario.*;
import com.jeplabs.ecommerce.infra.security.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

// Expone los endpoints de Auth, es decir lo relacionado a Usuario Autenticado y Autorizado.
@RestController // Indica que esta clase maneja peticiones HTTP y retorna JSON automáticamente
@RequestMapping("/api/auth") // Prefijo base para todos los endpoints de este controlador
@RequiredArgsConstructor
public class AuthController {

    // Inyecciones
    private final AutenticacionService service;
    private final AuthenticationManager authManager;
    private final TokenService tokenService;

    // POST /api/auth/register
    // Recibe los datos del nuevo usuario y lo registra en la base de datos
    @PostMapping("/register")
    public ResponseEntity<DatosRespuestaUsuario> registrar(
            @RequestBody @Valid DatosRegistro datos,
            UriComponentsBuilder uriBuilder) {

        DatosRespuestaUsuario respuesta = service.registrar(datos);
        var uri = uriBuilder.path("/api/usuarios/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    // POST /api/auth/login
    // Endpoint para realizar login
    @PostMapping("/login")
    public ResponseEntity<DatosRespuestaToken> login(
            @RequestBody @Valid DatosLogin datos) {

        var authToken = new UsernamePasswordAuthenticationToken(
                datos.email(), datos.password()
        );
        var usuarioAutenticado = authManager.authenticate(authToken);
        var token = tokenService.generarToken((Usuario) usuarioAutenticado.getPrincipal());
        return ResponseEntity.ok(new DatosRespuestaToken(token));
    }

    // POST /api/auth/usuarios/{id}/rol
    // Solo ADMIN puede cambiar roles, por medio de @PreAuthorize
    @PatchMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaUsuario> actualizarRol(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarRol datos) {
        return ResponseEntity.ok(service.actualizarRol(id, datos));
    }

    // POST /api/auth/usuarios
    // Lista los usuarios registrados, solo admin tiene acceso a este endpoint
    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DatosRespuestaUsuario>> listarUsuarios() {
        return ResponseEntity.ok(service.listarUsuarios());
    }

    // GET /api/auth/usuarios/{id}
    // Busqueda de un usuario por ID, solo admin tiene acceso a este endpoint
    @GetMapping("/usuarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaUsuario> buscarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

}
