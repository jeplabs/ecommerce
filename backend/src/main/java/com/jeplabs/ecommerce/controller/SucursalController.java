package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.sucursal.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor
@Tag(name = "Sucursales", description = "Gestión de sucursales físicas para retiro en tienda")
public class SucursalController {

    private final SucursalService service;

    @GetMapping
    @Operation(
            summary = "Listar sucursales activas",
            description = "Público. Devuelve las sucursales físicas activas ordenadas por orden de visualización para el checkout."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sucursales activas retornadas exitosamente")
    })
    public ResponseEntity<List<DatosRespuestaSucursal>> listarActivas() {
        return ResponseEntity.ok(service.listarActivas());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todas las sucursales (ADMIN)", description = "Solo ADMIN. Incluye sucursales activas e inactivas.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado completo de sucursales"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<List<DatosRespuestaSucursal>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener sucursal por ID (ADMIN)", description = "Solo ADMIN.")
    public ResponseEntity<DatosRespuestaSucursal> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear sucursal (ADMIN)", description = "Solo ADMIN. Registra una nueva sucursal física.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sucursal creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<DatosRespuestaSucursal> crear(
            @RequestBody @Valid DatosCrearSucursal datos) {
        return ResponseEntity.ok(service.crear(datos));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar sucursal (ADMIN)", description = "Solo ADMIN. Modifica parcialmente los datos de una sucursal.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sucursal actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<DatosRespuestaSucursal> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarSucursal datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activar sucursal (ADMIN)", description = "Solo ADMIN. Reactiva una sucursal para el checkout.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Sucursal activada"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        service.activar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar sucursal (ADMIN)", description = "Solo ADMIN. Desactiva una sucursal sin eliminar el historial de órdenes.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Sucursal desactivada"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}
