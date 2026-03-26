package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.usuario.AutenticacionService;
import com.jeplabs.ecommerce.domain.usuario.DatosActualizarPerfil;
import com.jeplabs.ecommerce.domain.usuario.DatosRespuestaUsuario;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// @Tag agrupa todos los endpoints de este controller bajo "Perfil" en Swagger UI
@Tag(name = "Perfil", description = "Datos del usuario autenticado. Requiere token JWT.")
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class PerfilController {

    private final AutenticacionService service;

    @Operation(
            summary = "Ver perfil",
            description = "Requiere token JWT. Retorna los datos del usuario actualmente autenticado."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil retornado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado")
    })
    @GetMapping("/perfil")
    public ResponseEntity<DatosRespuestaUsuario> verPerfil(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(service.verPerfil(email));
    }

    @Operation(
            summary = "Actualizar perfil",
            description = "Requiere token JWT. Actualiza los datos del usuario autenticado. " +
                    "Solo se modifican los campos enviados."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado")
    })
    @PatchMapping("/perfil")
    public ResponseEntity<DatosRespuestaUsuario> actualizarPerfil(
            Authentication authentication,
            @RequestBody @Valid DatosActualizarPerfil datos) {
        String email = authentication.getName();
        return ResponseEntity.ok(service.actualizarPerfil(email, datos));
    }
}