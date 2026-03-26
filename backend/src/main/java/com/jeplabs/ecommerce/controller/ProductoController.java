package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;
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

import java.util.List;

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
    // PATCH /api/productos/{id}
    // se puede enviar y actualizar solo una llave: valor, no necesariamente todas.
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

    // Admin cambia estado manualmente (OCULTO, DISPONIBLE, etc.)
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProductoAdmin> cambiarEstado(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarEstado datos) {
        return ResponseEntity.ok(service.cambiarEstado(id, datos));
    }

    @Operation(
            summary = "Descontinuar producto, borrado permanente, no se puede revertir",
            description = "Solo ADMIN. Realiza borrado permanente: el producto se descontinua " +
                    "no se elimina de la base de datos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Producto borrado y descontinuado exitosamente"),
            @ApiResponse(responseCode = "401", description = "Token inválido o expirado"),
            @ApiResponse(responseCode = "403", description = "No tienes permisos para esta acción"),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado")
    })
    // Borrado logico permanente, DESCONTINUADO, no se puede revertir
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> descontinuar (@PathVariable Long id) {
        service.descontinuar(id);
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

    // Listar categorías de un producto
    // GET /api/productos/{id}/categorias
    @GetMapping("/{id}/categorias")
    public ResponseEntity<List<DatosRespuestaCategoria>> listarCategorias(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarCategorias(id));
    }

    // Agregar categorías a un producto
    // POST /api/productos/{id}/categorias
    // Header: Authorization: Bearer <token_admin>
    // Body: { "categoriaIds": [3, 4] }
    @PostMapping("/{id}/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> agregarCategorias(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarCategorias datos) {
        return ResponseEntity.ok(service.agregarCategorias(id, datos));
    }

    // Quitar categorías específicas de un producto
    // DELETE /api/productos/{id}/categorias
    // Header: Authorization: Bearer <token_admin>
    // Body: { "categoriaIds": [2] }
    @DeleteMapping("/{id}/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> quitarCategorias(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarCategorias datos) {
        return ResponseEntity.ok(service.quitarCategorias(id, datos));
    }

    // Reemplazar todas las categorías de un producto
    // PUT /api/productos/{id}/categorias
    // Header: Authorization: Bearer <token_admin>
    // Body: { "categoriaIds": [1, 5] }
    @PutMapping("/{id}/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DatosRespuestaProducto> reemplazarCategorias(
            @PathVariable Long id,
            @RequestBody @Valid DatosActualizarCategorias datos) {
        return ResponseEntity.ok(service.reemplazarCategorias(id, datos));
    }
}