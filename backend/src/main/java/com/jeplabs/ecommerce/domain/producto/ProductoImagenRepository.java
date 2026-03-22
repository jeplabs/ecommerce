package com.jeplabs.ecommerce.domain.producto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// Repositorio básico para gestión de imágenes.
public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, Long> {

    // List<ProductoImagen> findByProductoId(Long productoId);

    List<ProductoImagen> findByProductoIdOrderByPrincipalDesc(Long productoId);

    Optional<ProductoImagen> findByIdAndProductoId(Long id, Long productoId);

    // Quita la marca principal de todas las imágenes del producto (reset imagen principal
    // antes de agregar una nueva como principal)
    @Modifying
    @Query("UPDATE ProductoImagen i SET i.principal = false WHERE i.producto.id = :productoId")
    void resetearPrincipal(@Param("productoId") Long productoId);

}
