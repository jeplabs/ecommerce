package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.usuario.*;
import com.jeplabs.ecommerce.infra.exceptions.RefreshTokenInvalidoException;
import com.jeplabs.ecommerce.infra.security.RefreshCookieHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
import java.util.Map;

// @Tag agrupa todos los endpoints de este controller bajo "Autenticación" en Swagger UI
@Tag(name = "Autenticación", description = "Registro, login, renovación de sesión y gestión de usuarios (admin)")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AutenticacionService service;
    private final AuthenticationManager authManager;
    private final RefreshTokenService refreshTokenService;
    private final RefreshCookieHelper refreshCookieHelper;
    private final PasswordResetService passwordResetService;

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
            description = "Autentica al usuario, retorna un Access Token JWT y establece una Cookie HttpOnly con el Refresh Token."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login exitoso, retorna Access Token JWT y emite cookie HttpOnly"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas"),
            @ApiResponse(responseCode = "403", description = "Cuenta bloqueada temporalmente")
    })
    @PostMapping("/login")
    public ResponseEntity<DatosRespuestaToken> login(
            @RequestBody @Valid DatosLogin datos,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            service.verificarBloqueoExpirado(datos.email());
            var authToken = new UsernamePasswordAuthenticationToken(datos.email(), datos.password());
            var usuarioAutenticado = authManager.authenticate(authToken);
            Usuario usuario = (Usuario) usuarioAutenticado.getPrincipal();
            service.procesarLoginExitoso(datos.email());

            var emision = refreshTokenService.emitirNuevaSesion(
                    usuario,
                    extraerIpCliente(request),
                    request.getHeader("User-Agent")
            );
            refreshCookieHelper.escribirCookieRefresh(
                    response,
                    emision.rawRefreshToken(),
                    emision.refreshMaxAgeSeconds()
            );

            return ResponseEntity.ok(new DatosRespuestaToken(emision.accessToken(), usuario));
        } catch (BadCredentialsException e) {
            service.procesarLoginFallido(datos.email());
            throw e;
        }
    }

    @Operation(
            summary = "Renovar sesión silenciosamente (Refresh Token)",
            description = "Lee el Refresh Token desde la Cookie HttpOnly, lo rota en la misma familia y devuelve un nuevo Access Token."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token renovado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Refresh Token ausente, expirado o revocado")
    })
    @PostMapping("/refresh")
    public ResponseEntity<DatosRespuestaToken> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            String rawRefreshToken = refreshCookieHelper.extraerRefreshToken(request)
                    .orElseThrow(() -> new RefreshTokenInvalidoException("No se encontró sesión activa para renovar"));

            var emision = refreshTokenService.rotarToken(
                    rawRefreshToken,
                    extraerIpCliente(request),
                    request.getHeader("User-Agent")
            );
            refreshCookieHelper.escribirCookieRefresh(
                    response,
                    emision.rawRefreshToken(),
                    emision.refreshMaxAgeSeconds()
            );

            return ResponseEntity.ok(new DatosRespuestaToken(emision.accessToken(), emision.usuario()));
        } catch (RefreshTokenInvalidoException e) {
            refreshCookieHelper.limpiarCookieRefresh(response);
            throw e;
        }
    }

    @Operation(
            summary = "Cerrar sesión actual",
            description = "Revoca la familia del Refresh Token actual en base de datos y elimina la Cookie HttpOnly."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Sesión cerrada exitosamente")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        refreshCookieHelper.extraerRefreshToken(request)
                .ifPresent(refreshTokenService::revocarPorRawToken);
        refreshCookieHelper.limpiarCookieRefresh(response);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Cerrar todas las sesiones del usuario",
            description = "Revoca todos los Refresh Tokens activos del usuario autenticado en todos sus dispositivos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Todas las sesiones fueron revocadas"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(
            Authentication authentication,
            HttpServletResponse response) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        refreshTokenService.revocarTodasLasSesionesUsuario(usuario.getId());
        refreshCookieHelper.limpiarCookieRefresh(response);
        return ResponseEntity.noContent().build();
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

    // Solicitar restablecimiento - público
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> solicitarReset(
            @RequestBody @Valid DatosSolicitarReset datos) {
        passwordResetService.solicitarReset(datos);
        // Siempre devuelve el mismo mensaje por seguridad
        // no revelamos si el email existe o no
        return ResponseEntity.ok(Map.of("mensaje",
                "Si el email está registrado recibirás un enlace para restablecer tu contraseña"));
    }

    // Restablecer contraseña con token - público
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetearPassword(
            @RequestBody @Valid DatosResetPassword datos) {
        passwordResetService.resetearPassword(datos);
        return ResponseEntity.ok(Map.of("mensaje",
                "Contraseña actualizada correctamente"));
    }

    private String extraerIpCliente(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
