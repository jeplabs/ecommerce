package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.pago.DatosRespuestaMetodoPago;
import com.jeplabs.ecommerce.domain.pago.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos/metodos")
@RequiredArgsConstructor
@Tag(name = "Métodos de Pago", description = "Gestión de métodos de pago disponibles")
public class MetodoPagoController {

    private final MetodoPagoService service;

    @GetMapping
    @Operation(summary = "Listar métodos de pago activos",
            description = "Público. Devuelve los métodos disponibles para el checkout")
    public ResponseEntity<List<DatosRespuestaMetodoPago>> listarActivos() {
        return ResponseEntity.ok(service.listarActivos());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los métodos de pago", description = "Solo ADMIN")
    public ResponseEntity<List<DatosRespuestaMetodoPago>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear método de pago", description = "Solo ADMIN")
    public ResponseEntity<DatosRespuestaMetodoPago> crear(
            @RequestBody @Valid DatosCrearMetodoPago datos) {
        return ResponseEntity.ok(service.crear(datos));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar método de pago", description = "Solo ADMIN")
    public ResponseEntity<DatosRespuestaMetodoPago> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarMetodoPago datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activar método de pago", description = "Solo ADMIN")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        service.activar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar método de pago", description = "Solo ADMIN")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}