package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.categoria.CategoriaService;
import com.jeplabs.ecommerce.domain.categoria.DatosCrearCategoria;
import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

// @Tag agrupa todos los endpoints de este controller bajo "Categorías" en Swagger UI
@Tag(name = "Categorías", description = "Gestión del árbol jerárquico de categorías")
@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService service;

    @Operation(
            summary = "Listar todas las categorías",
            description = "Público. Retorna el árbol jerárquico completo de categorías."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada exitosamente")
    })
    @GetMapping
    public ResponseEntity<List<DatosRespuestaCategoria>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @Operation(
            summary = "Buscar categoría por ID",
            description = "Público. Retorna una categoría específica con sus subcategorías."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoría encontrada"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaCategoria> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(
            summary = "Buscar categoría por slug",
            description = "Público. Útil para URLs amigables en el frontend."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoría encontrada"),
            @ApiResponse(responseCode = "404", description = "Slug no encontrado")
    })
    @GetMapping("/slug/{slug}")
    public ResponseEntity<DatosRespuestaCategoria> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.buscarPorSlug(slug));
    }

    @Operation(
            summary = "Crear categoría",
            description = "Solo ADMIN. Si 'parentId' es null se crea como categoría raíz. " +
                    "Si 'parentId' tiene valor, se crea como subcategoría hija."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoría creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaCategoria> crear(
            @RequestBody @Valid DatosCrearCategoria datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaCategoria respuesta = service.crear(datos);
        var uri = uriBuilder.path("/api/categorias/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    @Operation(
            summary = "Actualizar categoría",
            description = "Solo ADMIN. Actualiza nombre o categoría padre."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoría actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Categoría no encontrada")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaCategoria> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosCrearCategoria datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }
}