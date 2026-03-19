package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.producto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService service;

    // Endpoints públicos
    // GET /api/productos
    @GetMapping
    public ResponseEntity<Page<DatosRespuestaProducto>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @PageableDefault(size = 10, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(service.listar(nombre, categoriaId, pageable));
    }

    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaProducto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // GET /api/productos/sku/{sku}
    @GetMapping("/sku/{sku}")
    public ResponseEntity<DatosRespuestaProducto> buscarPorSku(@PathVariable String sku) {
        return ResponseEntity.ok(service.buscarPorSku(sku));
    }

    // GET /api/productos/slug/{slug}
    @GetMapping("/slug/{slug}")
    public ResponseEntity<DatosRespuestaProducto> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.buscarPorSlug(slug));
    }

    // Endpoints admin - Buscar un producto por id para ver datos exclusivos de admin
    // POST /api/productos/admin/{id}
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProductoAdmin> buscarAdminPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarAdminPorId(id));
    }

    // POST /api/productos
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> crear(
            @RequestBody @Valid DatosCrearProducto datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaProducto respuesta = service.crear(datos);
        var uri = uriBuilder.path("/api/productos/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    // PATCH /api/productos/{id}
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarProducto datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    // PATCH /api/productos/{id}/precio
    @PatchMapping("/{id}/precio")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProductoAdmin> actualizarPrecio(
            @PathVariable Long id,
            @RequestBody @Valid DatosPrecio datos) {
        return ResponseEntity.ok(service.actualizarPrecio(id, datos));
    }

    // DEL /api/productos/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    // Listar imágenes de un producto
    // GET /api/productos/{id}/imagenes
    @GetMapping("/{id}/imagenes")
    public ResponseEntity<List<DatosRespuestaImagen>> listarImagenes(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarImagenes(id));
    }

    // Agregar imágenes a un producto existente
    // POST /api/productos/{id}/imagenes
    @PostMapping("/{id}/imagenes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DatosRespuestaImagen>> agregarImagenes(
            @PathVariable Long id,
            @RequestBody @Valid DatosAgregarImagenes datos) {
        return ResponseEntity.ok(service.agregarImagenes(id, datos));
    }

    // Cambiar imagen principal
    // PATCH /api/productos/{id}/imagenes/{imagenId}/principal
    @PatchMapping("/{id}/imagenes/{imagenId}/principal")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaImagen> cambiarImagenPrincipal(
            @PathVariable Long id,
            @PathVariable Long imagenId) {
        return ResponseEntity.ok(service.cambiarImagenPrincipal(id, imagenId));
    }

    // Eliminar imagen
    // DEL /api/productos/{id}/imagenes/{imagenId}
    @DeleteMapping("/{id}/imagenes/{imagenId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarImagen(
            @PathVariable Long id,
            @PathVariable Long imagenId) {
        service.eliminarImagen(id, imagenId);
        return ResponseEntity.noContent().build();
    }
}