package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.carrito.CarritoService;
import com.jeplabs.ecommerce.domain.carrito.DatosAgregarItem;
import com.jeplabs.ecommerce.domain.carrito.DatosActualizarCantidad;
import com.jeplabs.ecommerce.domain.carrito.DatosRespuestaCarrito;
import com.jeplabs.ecommerce.domain.carrito.DatosRespuestaRestauracion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Carrito", description = "Gestión del carrito de compras del usuario autenticado")
@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService service;

    @Operation(summary = "Ver carrito activo", description = "Obtiene el carrito activo del usuario. Si no existe, lo crea automáticamente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Carrito obtenido exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @GetMapping
    public ResponseEntity<DatosRespuestaCarrito> verCarrito(Authentication authentication) {
        return ResponseEntity.ok(service.verOCrearCarrito(authentication.getName()));
    }

    @Operation(summary = "Agregar producto al carrito", description = "Agrega un producto con la cantidad solicitada. Si ya está en el carrito, suma la cantidad.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto agregado correctamente"),
            @ApiResponse(responseCode = "400", description = "Stock insuficiente o datos inválidos"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PostMapping("/items")
    public ResponseEntity<DatosRespuestaCarrito> agregarItem(
            Authentication authentication,
            @RequestBody @Valid DatosAgregarItem datos) {
        return ResponseEntity.ok(service.agregarItem(authentication.getName(), datos));
    }

    @Operation(summary = "Actualizar cantidad de un item", description = "Modifica la cantidad de un producto específico en el carrito.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Cantidad actualizada correctamente"),
            @ApiResponse(responseCode = "400", description = "Stock insuficiente o cantidad inválida"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Item no encontrado en el carrito")
    })
    @PatchMapping("/items/{itemId}")
    public ResponseEntity<DatosRespuestaCarrito> actualizarCantidad(
            Authentication authentication,
            @PathVariable Long itemId,
            @RequestBody @Valid DatosActualizarCantidad datos) {
        return ResponseEntity.ok(service.actualizarCantidad(authentication.getName(), itemId, datos));
    }

    @Operation(summary = "Eliminar un item del carrito", description = "Elimina un producto específico del carrito activo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Item eliminado correctamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "404", description = "Item no encontrado en el carrito")
    })
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<DatosRespuestaCarrito> eliminarItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(service.eliminarItem(authentication.getName(), itemId));
    }

    @Operation(summary = "Vaciar el carrito", description = "Elimina todos los items del carrito activo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Carrito vaciado exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @DeleteMapping
    public ResponseEntity<DatosRespuestaCarrito> vaciarCarrito(Authentication authentication) {
        return ResponseEntity.ok(service.vaciarCarrito(authentication.getName()));
    }

    @Operation(summary = "Abandonar el carrito", description = "Marca el carrito activo como abandonado.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Carrito marcado como abandonado"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PatchMapping("/abandonar")
    public ResponseEntity<Void> abandonarCarrito(Authentication authentication) {
        service.abandonarCarrito(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Renovar expiración del carrito", description = "Extiende el tiempo de expiración del carrito activo por N minutos adicionales.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Carrito renovado exitosamente"),
            @ApiResponse(responseCode = "401", description = "No autenticado"),
            @ApiResponse(responseCode = "410", description = "El carrito ya había expirado y no puede renovarse")
    })
    @PostMapping("/renovar")
    public ResponseEntity<DatosRespuestaCarrito> renovarCarrito(Authentication authentication) {
        return ResponseEntity.ok(service.renovar(authentication.getName()));
    }

    @Operation(summary = "Restaurar productos de carrito expirado", description = "Copia los productos del último carrito expirado al carrito activo con stock y precio vigentes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Productos restaurados exitosamente"),
            @ApiResponse(responseCode = "400", description = "No hay ningún carrito expirado para restaurar"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    @PostMapping("/restaurar")
    public ResponseEntity<DatosRespuestaRestauracion> restaurarCarrito(Authentication authentication) {
        return ResponseEntity.ok(service.restaurar(authentication.getName()));
    }
}