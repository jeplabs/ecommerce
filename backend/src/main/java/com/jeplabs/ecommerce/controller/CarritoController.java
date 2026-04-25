package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.carrito.CarritoService;
import com.jeplabs.ecommerce.domain.carrito.DatosAgregarItem;
import com.jeplabs.ecommerce.domain.carrito.DatosActualizarCantidad;
import com.jeplabs.ecommerce.domain.carrito.DatosRespuestaCarrito;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService service;

    // Ver carrito activo, si no existe lo crea automáticamente
    @GetMapping
    public ResponseEntity<DatosRespuestaCarrito> verCarrito(Authentication authentication) {
        return ResponseEntity.ok(service.verOCrearCarrito(authentication.getName()));
    }

    // Agregar producto al carrito
    @PostMapping("/items")
    public ResponseEntity<DatosRespuestaCarrito> agregarItem(
            Authentication authentication,
            @RequestBody @Valid DatosAgregarItem datos) {
        return ResponseEntity.ok(service.agregarItem(authentication.getName(), datos));
    }

    // Actualizar cantidad de un item específico
    @PatchMapping("/items/{itemId}")
    public ResponseEntity<DatosRespuestaCarrito> actualizarCantidad(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody @Valid DatosActualizarCantidad datos) {
        return ResponseEntity.ok(service.actualizarCantidad(authentication.getName(), itemId, datos));
    }

    // Eliminar un producto específico del carrito
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<DatosRespuestaCarrito> eliminarItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(service.eliminarItem(authentication.getName(), itemId));
    }

    // Vaciar el carrito completo
    @DeleteMapping
    public ResponseEntity<DatosRespuestaCarrito> vaciarCarrito(Authentication authentication) {
        return ResponseEntity.ok(service.vaciarCarrito(authentication.getName()));
    }

    // Abandonar el carrito
    @PatchMapping("/abandonar")
    public ResponseEntity<Void> abandonarCarrito(Authentication authentication) {
        service.abandonarCarrito(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}