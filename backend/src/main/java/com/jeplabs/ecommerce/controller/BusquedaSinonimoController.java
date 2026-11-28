package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.producto.BusquedaSinonimoService;
import com.jeplabs.ecommerce.domain.producto.DatosActualizarBusquedaSinonimo;
import com.jeplabs.ecommerce.domain.producto.DatosCrearBusquedaSinonimo;
import com.jeplabs.ecommerce.domain.producto.DatosRespuestaBusquedaSinonimo;
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

@Tag(name = "Sinónimos de Búsqueda", description = "Gestión administrativa de grupos de sinónimos para el buscador de catálogo")
@RestController
@RequestMapping("/api/admin/busqueda/sinonimos")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class BusquedaSinonimoController {

    private final BusquedaSinonimoService service;

    @Operation(summary = "Listar grupos de sinónimos", description = "Solo ADMIN. Retorna todos los grupos de sinónimos configurados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción")
    })
    @GetMapping
    public ResponseEntity<List<DatosRespuestaBusquedaSinonimo>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @Operation(summary = "Buscar grupo de sinónimos por ID", description = "Solo ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupo encontrado"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaBusquedaSinonimo> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Crear grupo de sinónimos", description = "Solo ADMIN. Invalida la caché del buscador de forma inmediata.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Grupo creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o nombre duplicado")
    })
    @PostMapping
    public ResponseEntity<DatosRespuestaBusquedaSinonimo> crear(
            @RequestBody @Valid DatosCrearBusquedaSinonimo datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaBusquedaSinonimo respuesta = service.crear(datos);
        var uri = uriBuilder.path("/api/admin/busqueda/sinonimos/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    @Operation(summary = "Actualizar grupo de sinónimos", description = "Solo ADMIN. Actualiza términos o estado e invalida la caché de búsqueda.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupo actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    @PutMapping("/{id}")
    public ResponseEntity<DatosRespuestaBusquedaSinonimo> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarBusquedaSinonimo datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @Operation(summary = "Activar o desactivar grupo de sinónimos", description = "Solo ADMIN. Alterna el estado activo e invalida la caché.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    @PatchMapping("/{id}/estado")
    public ResponseEntity<DatosRespuestaBusquedaSinonimo> toggleActivo(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActivo(id));
    }

    @Operation(summary = "Eliminar grupo de sinónimos", description = "Solo ADMIN. Elimina el grupo e invalida la caché.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Grupo eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Grupo no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
