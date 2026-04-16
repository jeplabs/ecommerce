package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.direccion.DireccionService;
import com.jeplabs.ecommerce.domain.direccion.DatosCrearDireccion;
import com.jeplabs.ecommerce.domain.direccion.DatosActualizarDireccion;
import com.jeplabs.ecommerce.domain.direccion.DatosRespuestaDireccion;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService service;

    // Usuario autenticado lista sus propias direcciones
    @GetMapping
    public ResponseEntity<List<DatosRespuestaDireccion>> listar(Authentication authentication) {
        return ResponseEntity.ok(service.listar(authentication.getName()));
    }

    // Admin lista direcciones de cualquier usuario
    @GetMapping("/usuario/{usuarioId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DatosRespuestaDireccion>> listarPorUsuario(
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.listarPorUsuario(usuarioId));
    }

    // Usuario crea una nueva dirección
    @PostMapping
    public ResponseEntity<DatosRespuestaDireccion> crear(
            Authentication authentication,
            @RequestBody @Valid DatosCrearDireccion datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaDireccion respuesta = service.crear(authentication.getName(), datos);
        var uri = uriBuilder.path("/api/direcciones/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    // Usuario actualiza una dirección propia
    @PatchMapping("/{id}")
    public ResponseEntity<DatosRespuestaDireccion> actualizar(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarDireccion datos) {
        return ResponseEntity.ok(service.actualizar(authentication.getName(), id, datos));
    }

    // Usuario cambia su dirección principal
    @PatchMapping("/{id}/principal")
    public ResponseEntity<DatosRespuestaDireccion> cambiarPrincipal(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(service.cambiarPrincipal(authentication.getName(), id));
    }

    // Usuario elimina una dirección propia (borrado lógico)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            Authentication authentication,
            @PathVariable Long id) {
        service.eliminar(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}