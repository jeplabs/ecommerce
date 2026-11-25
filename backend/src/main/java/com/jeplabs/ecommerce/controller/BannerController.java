package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.banner.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Tag(name = "Banners", description = "Gestión de banners y contenido visual del Home")
public class BannerController {

    private final BannerService service;

    @GetMapping
    @Operation(
            summary = "Listar banners vigentes",
            description = "Público. Devuelve los banners activos y vigentes por fecha para la sección indicada, ordenados por orden ascendente."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Banners vigentes retornados exitosamente")
    })
    public ResponseEntity<List<DatosRespuestaBanner>> listarVigentes(
            @RequestParam(defaultValue = "HERO_CAROUSEL") SeccionBanner seccion) {
        return ResponseEntity.ok(service.listarVigentes(seccion));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Listar banners (ADMIN)",
            description = "Solo ADMIN. Lista todos los banners (activos, inactivos, programados o expirados), opcionalmente filtrados por sección."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado administrativo de banners"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<List<DatosRespuestaBanner>> listarAdmin(
            @RequestParam(required = false) SeccionBanner seccion) {
        return ResponseEntity.ok(service.listarAdmin(seccion));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener banner por ID (ADMIN)", description = "Solo ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Banner encontrado"),
            @ApiResponse(responseCode = "404", description = "Banner no encontrado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<DatosRespuestaBanner> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear banner (ADMIN)", description = "Solo ADMIN. Registra un nuevo banner visual.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Banner creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<DatosRespuestaBanner> crear(
            @RequestBody @Valid DatosCrearBanner datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar banner (ADMIN)", description = "Solo ADMIN. Actualiza metadatos, imágenes, enlaces y vigencia de un banner.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Banner actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Banner no encontrado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<DatosRespuestaBanner> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarBanner datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Alternar estado activo del banner (ADMIN)", description = "Solo ADMIN. Pausa o reactiva una campaña sin eliminar el banner.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Banner no encontrado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<DatosRespuestaBanner> toggleActivo(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActivo(id));
    }

    @PutMapping("/reordenar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reordenar banners (ADMIN)", description = "Solo ADMIN. Asigna el orden 1..N según el arreglo de IDs recibido.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Banners reordenados exitosamente"),
            @ApiResponse(responseCode = "400", description = "Lista inválida o IDs inexistentes/duplicados"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<List<DatosRespuestaBanner>> reordenar(
            @RequestBody @Valid DatosReordenarBanners datos) {
        return ResponseEntity.ok(service.reordenar(datos));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar banner (ADMIN)", description = "Solo ADMIN. Elimina físicamente un banner.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Banner eliminado"),
            @ApiResponse(responseCode = "404", description = "Banner no encontrado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
