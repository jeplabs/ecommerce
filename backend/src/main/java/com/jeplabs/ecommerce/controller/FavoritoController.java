package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.favorito.DatosRespuestaFavorito;
import com.jeplabs.ecommerce.domain.favorito.FavoritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
@Tag(name = "Favoritos", description = "Gestión de productos favoritos del usuario")
public class FavoritoController {

    private final FavoritoService service;

    @GetMapping
    @Operation(summary = "Listar favoritos paginados",
            description = "Devuelve los productos favoritos del usuario autenticado de forma paginada.")
    public ResponseEntity<Page<DatosRespuestaFavorito>> listar(
            Authentication authentication,
            @PageableDefault(size = 12, sort = "creadoAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.listarFavoritos(authentication.getName(), pageable));
    }

    @GetMapping("/ids")
    @Operation(summary = "Listar IDs de productos favoritos",
            description = "Endpoint ligero que devuelve solo los IDs de productos favoritos del usuario para marcar íconos en el catálogo.")
    public ResponseEntity<List<Long>> listarIds(Authentication authentication) {
        return ResponseEntity.ok(service.listarIdsFavoritos(authentication.getName()));
    }

    @GetMapping("/{productoId}/existe")
    @Operation(summary = "Verificar si es favorito",
            description = "Indica si un producto específico está en los favoritos del usuario")
    public ResponseEntity<Boolean> esFavorito(
            @PathVariable Long productoId, Authentication authentication) {
        return ResponseEntity.ok(service.esFavorito(authentication.getName(), productoId));
    }

    @PostMapping("/{productoId}")
    @Operation(summary = "Agregar a favoritos",
            description = "Agrega un producto a los favoritos del usuario. Idempotente si ya existe.")
    public ResponseEntity<DatosRespuestaFavorito> agregar(
            @PathVariable Long productoId, Authentication authentication) {
        return ResponseEntity.ok(service.agregarFavorito(authentication.getName(), productoId));
    }

    @DeleteMapping("/{productoId}")
    @Operation(summary = "Eliminar de favoritos",
            description = "Quita un producto de los favoritos del usuario")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long productoId, Authentication authentication) {
        service.eliminarFavorito(authentication.getName(), productoId);
        return ResponseEntity.noContent().build();
    }
}
