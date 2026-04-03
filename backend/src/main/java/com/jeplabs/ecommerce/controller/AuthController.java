package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.usuario.*;
import com.jeplabs.ecommerce.infra.security.TokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

// @Tag agrupa todos los endpoints de este controller bajo "Autenticación" en Swagger UI
@Tag(name = "Autenticación", description = "Registro, login y gestión de usuarios (admin)")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AutenticacionService service;
    private final AuthenticationManager authManager;
    private final TokenService tokenService;

    // @Operation describe el propósito del endpoint en Swagger UI
    // summary → título corto que aparece en la lista de endpoints
    // description → texto expandido al abrir el endpoint
    @Operation(
            summary = "Registrar nuevo usuario",
            description = "Crea una cuenta nueva. No requiere token."
    )
    // @ApiResponses define los posibles códigos HTTP que puede retornar el endpoint
    // cada @ApiResponse indica el código y una descripción de cuándo ocurre
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o email ya registrado")
    })
    @PostMapping("/register")
    public ResponseEntity<DatosRespuestaUsuario> registrar(
            @RequestBody @Valid DatosRegistro datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaUsuario respuesta = service.registrar(datos);
        var uri = uriBuilder.path("/api/usuarios/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica al usuario y retorna un JWT token. Úsalo en el botón 'Authorize'."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login exitoso, retorna token JWT"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas"),
            @ApiResponse(responseCode = "403", description = "Cuenta bloqueada temporalmente")
    })
    @PostMapping("/login")
    public ResponseEntity<DatosRespuestaToken> login(
            @RequestBody @Valid DatosLogin datos) {
        try {
            service.verificarBloqueoExpirado(datos.email());
            var authToken = new UsernamePasswordAuthenticationToken(datos.email(), datos.password());
            var usuarioAutenticado = authManager.authenticate(authToken);
            Usuario usuario = (Usuario) usuarioAutenticado.getPrincipal();
            service.procesarLoginExitoso(datos.email());
            var token = tokenService.generarToken(usuario);
            return ResponseEntity.ok(new DatosRespuestaToken(token, usuario));
        } catch (BadCredentialsException e) {
            service.procesarLoginFallido(datos.email());
            throw e;
        }
    }

    @Operation(
            summary = "Cambiar rol de usuario",
            description = "Solo ADMIN. Cambia el rol de un usuario por su ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rol actualizado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @PatchMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaUsuario> actualizarRol(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarRol datos) {
        return ResponseEntity.ok(service.actualizarRol(id, datos));
    }

    @Operation(
            summary = "Listar todos los usuarios",
            description = "Solo ADMIN. Retorna la lista completa de usuarios registrados."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción")
    })
    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DatosRespuestaUsuario>> listarUsuarios() {
        return ResponseEntity.ok(service.listarUsuarios());
    }

    @Operation(
            summary = "Buscar usuario por ID",
            description = "Solo ADMIN. Retorna los datos de un usuario específico."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    @GetMapping("/usuarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaUsuario> buscarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // Enpoint para actualizar el estado del usuario desactivar/activar
    // El email del admin autenticado se extrae del token mediante Authentication
    // PATCH /api/usuarios/{id}/estado
    @PatchMapping("/usuarios/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaUsuario> actualizarEstado(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarEstadoUsuario datos,
            Authentication authentication) {
        String emailAdmin = authentication.getName();
        return ResponseEntity.ok(service.actualizarEstado(id, datos, emailAdmin));
    }
}