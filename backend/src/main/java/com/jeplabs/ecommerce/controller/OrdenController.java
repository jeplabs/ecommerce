package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.orden.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService service;

    // Cliente lista sus propias órdenes
    @GetMapping
    public ResponseEntity<Page<DatosRespuestaOrden>> listarMisOrdenes(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                service.listarMisOrdenes(authentication.getName(), pageable));
    }

    // Cliente ve detalle de una orden propia
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaOrden> verMiOrden(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                service.buscarMiOrden(authentication.getName(), id));
    }

    // Cliente crea una orden desde su carrito
    @PostMapping
    public ResponseEntity<DatosRespuestaOrden> crear(
            Authentication authentication,
            @RequestBody @Valid DatosCrearOrden datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaOrden respuesta = service.crear(authentication.getName(), datos);
        var uri = uriBuilder.path("/api/ordenes/{id}")
                .buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    // Cliente cancela su propia orden
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<DatosRespuestaOrden> cancelarMiOrden(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                service.cancelarMiOrden(authentication.getName(), id));
    }

    // Admin lista todas las órdenes con filtro opcional por estado
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DatosRespuestaOrden>> listarTodas(
            @RequestParam(required = false) EstadoOrden estado,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(service.listarTodas(estado, pageable));
    }

    // Admin ve cualquier orden
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaOrden> verOrden(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // Admin cambia estado de una orden
    @PatchMapping("/admin/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaOrden> cambiarEstado(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarEstadoOrden datos) {
        return ResponseEntity.ok(service.cambiarEstado(id, datos));
    }

    // Cliente sube comprobante en cualquier momento
    @PostMapping("/{id}/comprobante")
    @Operation(summary = "Subir comprobante de transferencia",
            description = "El cliente puede subir el comprobante en cualquier momento. Acepta PNG, JPG y PDF. Máximo 5MB")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comprobante subido exitosamente"),
            @ApiResponse(responseCode = "400", description = "Archivo inválido o tipo no permitido"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<DatosRespuestaOrden> subirComprobante(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(
                service.subirComprobante(authentication.getName(), id, archivo));
    }
}