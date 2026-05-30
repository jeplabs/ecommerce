package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.envio.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/envio")
@RequiredArgsConstructor
public class ServicioEnvioController {

    private final ServicioEnvioService service;

    // Público - opciones de envío con costos calculados según subtotal
    @GetMapping("/opciones")
    public ResponseEntity<DatosRespuestaOpcionesEnvio> listarOpciones(
            @RequestParam(defaultValue = "0") BigDecimal subtotal) {
        return ResponseEntity.ok(service.listarOpcionesEnvio(subtotal));
    }

    // Admin - crear servicio -  Estos endpoints de admin no se implementaran en el frontend
    // seran administrados directamente por el proveedor del servicio de la aplicacion
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaServicioEnvio> crear(
            @RequestBody @Valid DatosCrearServicioEnvio datos) {
        return ResponseEntity.ok(service.crear(datos));
    }

    // Admin - actualizar servicio
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaServicioEnvio> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarServicioEnvio datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    // Admin - desactivar servicio
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    // Admin - reactivar servicio
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        service.activar(id);
        return ResponseEntity.noContent().build();
    }
}