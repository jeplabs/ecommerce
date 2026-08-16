package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.orden.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@Tag(name = "Órdenes", description = "Gestión de pedidos de clientes y panel de administración")
@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService service;

    @Operation(summary = "Listar mis órdenes", description = "Cliente. Retorna el historial paginado de órdenes del usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de órdenes paginada"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping
    public ResponseEntity<Page<DatosRespuestaOrden>> listarMisOrdenes(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                service.listarMisOrdenes(authentication.getName(), pageable));
    }

    @Operation(summary = "Ver detalle de mi orden", description = "Cliente. Retorna los detalles de una orden propia por ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Detalle de la orden"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaOrden> verMiOrden(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                service.buscarMiOrden(authentication.getName(), id));
    }

    @Operation(summary = "Crear orden desde el carrito", description = "Cliente. Crea una nueva orden a partir de los items del carrito activo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Orden creada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Carrito vacío, stock insuficiente o datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PostMapping
    public ResponseEntity<DatosRespuestaOrden> crear(
            Authentication authentication,
            @RequestBody @Valid DatosCrearOrden datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaOrden respuesta = service.crear(authentication.getName(), datos);
        var uri = uriBuilder.path("/api/ordenes/{id}")
                .buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    @Operation(summary = "Cancelar mi orden", description = "Cliente. Cancela una orden propia si aún está en estado PENDIENTE.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orden cancelada exitosamente"),
            @ApiResponse(responseCode = "400", description = "La orden no puede cancelarse en su estado actual"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<DatosRespuestaOrden> cancelarMiOrden(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(
                service.cancelarMiOrden(authentication.getName(), id));
    }

    @Operation(summary = "Listar todas las órdenes (ADMIN)", description = "Solo ADMIN. Retorna el listado paginado con filtro opcional por estado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista paginada de todas las órdenes"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DatosRespuestaOrden>> listarTodas(
            @RequestParam(required = false) EstadoOrden estado,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(service.listarTodas(estado, pageable));
    }

    @Operation(summary = "Ver cualquier orden (ADMIN)", description = "Solo ADMIN. Retorna el detalle completo de cualquier orden.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Detalle de la orden"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaOrden> verOrden(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(summary = "Cambiar estado de orden (ADMIN)", description = "Solo ADMIN. Transiciona el estado de la orden (CONFIRMADA, ENVIADA, ENTREGADA, etc.).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estado de orden actualizado"),
            @ApiResponse(responseCode = "400", description = "Transición de estado inválida"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    @PatchMapping("/admin/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaOrden> cambiarEstado(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarEstadoOrden datos) {
        return ResponseEntity.ok(service.cambiarEstado(id, datos));
    }

    @PostMapping("/{id}/comprobante")
    @Operation(summary = "Subir comprobante de transferencia",
            description = "El cliente puede subir el comprobante en cualquier momento. Acepta PNG, JPG y PDF. Máximo 5MB")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comprobante subido exitosamente"),
            @ApiResponse(responseCode = "400", description = "Archivo inválido o tipo no permitido"),
            @ApiResponse(responseCode = "404", description = "Orden no encontrada")
    })
    public ResponseEntity<DatosRespuestaOrden> subirComprobante(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(
                service.subirComprobante(authentication.getName(), id, archivo));
    }
}