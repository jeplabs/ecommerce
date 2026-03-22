package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.producto.*;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

// @Tag agrupa todos los endpoints de este controller bajo "Productos" en Swagger UI
@Tag(name = "Productos", description = "Catálogo público y gestión admin de productos")
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService service;

    @Operation(
            summary = "Listar productos",
            description = "Público. Soporta filtros por nombre y categoría, y paginación. " +
                    "Ejemplo: /api/productos?nombre=rtx&categoriaId=2&page=0&size=10"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de productos retornada exitosamente")
    })
    @GetMapping
    public ResponseEntity<Page<DatosRespuestaProducto>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @PageableDefault(size = 10, sort = "nombre") Pageable pageable) {
        return ResponseEntity.ok(service.listar(nombre, categoriaId, pageable));
    }

    @Operation(
            summary = "Buscar producto por ID",
            description = "Público. Retorna los datos visibles del producto."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DatosRespuestaProducto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @Operation(
            summary = "Buscar producto por SKU",
            description = "Público. Retorna el producto que coincide con el SKU exacto."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "SKU no encontrado")
    })
    @GetMapping("/sku/{sku}")
    public ResponseEntity<DatosRespuestaProducto> buscarPorSku(@PathVariable String sku) {
        return ResponseEntity.ok(service.buscarPorSku(sku));
    }

    @Operation(
            summary = "Buscar producto por slug",
            description = "Público. Útil para URLs amigables en el frontend."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "404", description = "Slug no encontrado")
    })
    @GetMapping("/slug/{slug}")
    public ResponseEntity<DatosRespuestaProducto> buscarPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.buscarPorSlug(slug));
    }

    @Operation(
            summary = "Buscar producto por ID (vista admin)",
            description = "Solo ADMIN. Retorna datos extendidos del producto, incluyendo campos internos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProductoAdmin> buscarAdminPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarAdminPorId(id));
    }

    @Operation(
            summary = "Crear producto",
            description = "Solo ADMIN. El SKU se genera automáticamente a partir de categoría, " +
                    "marca, modelo, capacidad y color."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Producto creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> crear(
            @RequestBody @Valid DatosCrearProducto datos,
            UriComponentsBuilder uriBuilder) {
        DatosRespuestaProducto respuesta = service.crear(datos);
        var uri = uriBuilder.path("/api/productos/{id}").buildAndExpand(respuesta.id()).toUri();
        return ResponseEntity.created(uri).body(respuesta);
    }

    @Operation(
            summary = "Actualizar producto",
            description = "Solo ADMIN. Actualiza los campos del producto. Solo se modifican los campos enviados."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> actualizar(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarProducto datos) {
        return ResponseEntity.ok(service.actualizar(id, datos));
    }

    @Operation(
            summary = "Actualizar precio",
            description = "Solo ADMIN. Endpoint dedicado exclusivamente a cambios de precio."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Precio actualizado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @PatchMapping("/{id}/precio")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProductoAdmin> actualizarPrecio(
            @PathVariable Long id,
            @RequestBody @Valid DatosPrecio datos) {
        return ResponseEntity.ok(service.actualizarPrecio(id, datos));
    }

    @Operation(
            summary = "Desactivar producto",
            description = "Solo ADMIN. Realiza un soft delete: el producto deja de ser visible " +
                    "públicamente pero no se elimina de la base de datos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Producto desactivado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }
}