package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.direccion.DireccionService;
import com.jeplabs.ecommerce.domain.direccion.DatosCrearDireccion;
import com.jeplabs.ecommerce.domain.direccion.DatosActualizarDireccion;
import com.jeplabs.ecommerce.domain.direccion.DatosRespuestaDireccion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Tag(name = "Direcciones", description = "Gestión de direcciones de envío de los usuarios")
@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService service;

    @Operation(summary = "Listar mis direcciones", description = "Retorna todas las direcciones activas del usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Direcciones obtenidas exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping
    public ResponseEntity<List<DatosRespuestaDireccion>> listar(Authentication authentication) {
        return ResponseEntity.ok(service.listar(authentication.getName()));
    }

    @Operation(summary = "Listar direcciones por usuario (ADMIN)", description = "Solo ADMIN. Retorna las direcciones de un usuario específico.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Direcciones del usuario obtenidas"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DatosRespuestaDireccion>> listarPorUsuario(
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
    }

    @Operation(summary = "Crear dirección", description = "Crea una nueva dirección de envío para el usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Dirección creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos de dirección inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PostMapping
    public ResponseEntity<DatosRespuestaDireccion> crear(
            Authentication authentication,
            @RequestBody @Valid DatosCrearDireccion datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaDireccion respuesta = service.crear(authentication.getName(), datos);
        var uri = uriBuilder.path("/api/direcciones/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    @Operation(summary = "Actualizar dirección", description = "Actualiza los datos de una dirección propia del usuario.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dirección actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    })
    @PatchMapping("/{id}")
    public ResponseEntity<DatosRespuestaDireccion> actualizar(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarDireccion datos) {
        return ResponseEntity.ok(service.actualizar(authentication.getName(), id, datos));
    }

    @Operation(summary = "Cambiar dirección principal", description = "Marca la dirección indicada como la principal del usuario.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dirección principal actualizada"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    })
    @PatchMapping("/{id}/principal")
    public ResponseEntity<DatosRespuestaDireccion> cambiarPrincipal(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(service.cambiarPrincipal(authentication.getName(), id));
    }

    @Operation(summary = "Eliminar dirección", description = "Realiza un borrado lógico de la dirección propia del usuario.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Dirección eliminada correctamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Dirección no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            Authentication authentication,
            @PathVariable Long id) {
        service.eliminar(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}