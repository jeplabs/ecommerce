package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.favorito.DatosRespuestaFavorito;
import com.jeplabs.ecommerce.domain.favorito.FavoritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
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
    @Operation(summary = "Listar favoritos",
            description = "Devuelve todos los productos favoritos del usuario autenticado")
    public ResponseEntity<List<DatosRespuestaFavorito>> listar(Authentication authentication) {
        return ResponseEntity.ok(service.listarFavoritos(authentication.getName()));
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
