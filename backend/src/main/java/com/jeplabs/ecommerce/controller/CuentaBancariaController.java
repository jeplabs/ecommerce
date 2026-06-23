package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.banco.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banco")
@RequiredArgsConstructor
@Tag(name = "Cuentas Bancarias", description = "Gestión de cuentas para transferencias")
public class CuentaBancariaController {

    private final CuentaBancariaService service;

    // Público - el cliente ve las cuentas activas al elegir transferencia
    @GetMapping
    @Operation(summary = "Listar cuentas bancarias activas",
            description = "Público. Máximo 3 cuentas ordenadas por orden de visualización")
    public ResponseEntity<List<DatosRespuestaCuentaBancaria>> listarActivas() {
        return ResponseEntity.ok(service.listarActivas());
    }

    // Admin - ve todas incluyendo desactivadas
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todas las cuentas", description = "Solo ADMIN")
    public ResponseEntity<List<DatosRespuestaCuentaBancaria>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear cuenta bancaria", description = "Solo ADMIN")
    public ResponseEntity<DatosRespuestaCuentaBancaria> crear(
            @RequestBody @Valid DatosCrearCuentaBancaria datos) {
        return ResponseEntity.ok(service.crear(datos));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar cuenta bancaria", description = "Solo ADMIN")
    public ResponseEntity<DatosRespuestaCuentaBancaria> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarCuentaBancaria datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activar cuenta bancaria", description = "Solo ADMIN")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        service.activar(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar cuenta bancaria", description = "Solo ADMIN")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}