package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.categoria.CategoriaService;
import com.jeplabs.ecommerce.domain.categoria.DatosCrearCategoria;
import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService service;

    // Público - devuelve árbol jerárquico completo
    // GET /api/categorias
    @GetMapping
    public ResponseEntity<List<DatosRespuestaCategoria>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    // Público - buscar por ID
    // GET /api/categorias/{id}
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaCategoria> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    // Público - buscar por slug
    // GET /api/categorias/slug/{slug}
    @GetMapping("/slug/{slug}")
    public ResponseEntity<DatosRespuestaCategoria> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.buscarPorSlug(slug));
    }

    // Solo Admin
    // POST /api/categorias
    // Ejemplo: { "nombre": "Electronica", "parentId": null }, null es opcional, sino se envia igual la crea como raiz
    // Ejemplo: { "nombre": "Cámaras Mirrorless", "parentId": 1 }, crea una subcategoría hija de 1, Electrónica
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaCategoria> crear(
            @RequestBody @Valid DatosCrearCategoria datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaCategoria respuesta = service.crear(datos);
        var uri = uriBuilder.path("/api/categorias/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    // Solo Admin
    // POST /api/categorias/{id}
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaCategoria> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosCrearCategoria datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }
}
