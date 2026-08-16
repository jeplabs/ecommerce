package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.envio.*;
import com.jeplabs.ecommerce.domain.orden.FormaPagoEnvio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Servicios de Envío", description = "Opciones y tarifas de envío disponibles para el checkout")
@RestController
@RequestMapping("/api/envio")
@RequiredArgsConstructor
public class ServicioEnvioController {

    private final ServicioEnvioService service;

    @Operation(summary = "Listar opciones de envío", description = "Público. Devuelve las opciones de envío con costos calculados según el subtotal y forma de pago.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Opciones de envío retornadas exitosamente")
    })
    @GetMapping("/opciones")
    public ResponseEntity<DatosRespuestaOpcionesEnvio> listarOpciones(
            @RequestParam(defaultValue = "0") BigDecimal subtotal,
            @RequestParam(defaultValue = "EN_LINEA") FormaPagoEnvio formaPagoEnvio) {
        return ResponseEntity.ok(service.listarOpcionesEnvio(subtotal, formaPagoEnvio));
    }

    @Operation(summary = "Crear servicio de envío (ADMIN)", description = "Solo ADMIN. Registra una nueva empresa o tipo de envío.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Servicio de envío creado"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaServicioEnvio> crear(
            @RequestBody @Valid DatosCrearServicioEnvio datos) {
        return ResponseEntity.ok(service.crear(datos));
    }

    @Operation(summary = "Actualizar servicio de envío (ADMIN)", description = "Solo ADMIN. Modifica precios o datos del servicio.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Servicio actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @ApiResponse(responseCode = "404", description = "Servicio de envío no encontrado")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaServicioEnvio> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarServicioEnvio datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @Operation(summary = "Desactivar servicio de envío (ADMIN)", description = "Solo ADMIN. Desactiva temporalmente el servicio para el checkout.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Servicio desactivado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Activar servicio de envío (ADMIN)", description = "Solo ADMIN. Reactiva el servicio para que aparezca en el checkout.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Servicio reactivado"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado"),
            @ApiResponse(responseCode = "404", description = "Servicio no encontrado")
    })
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        service.activar(id);
        return ResponseEntity.noContent().build();
    }
}