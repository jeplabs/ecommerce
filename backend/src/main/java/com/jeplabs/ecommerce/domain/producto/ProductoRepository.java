package com.jeplabs.ecommerce.domain.producto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

// Incluye métodos para búsqueda por SKU, slug y filtros.
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findBySku(String sku);
    Optional<Producto> findBySlug(String slug);
    boolean existsBySku(String sku);
    boolean existsBySlug(String slug);

    // Busca productos activos con filtro opcional por nombre y/o categoría
    // Se usa nativeQuery
    @Query(value = """
        SELECT DISTINCT p.* FROM productos p
        LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
        WHERE p.estado IN ('DISPONIBLE', 'SIN_STOCK')
        AND (:nombre IS NULL OR LOWER(p.nombre::varchar) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND (:categoriaId IS NULL OR pc.categoria_id = :categoriaId)
        ORDER BY p.nombre
        """,
            countQuery = """
        SELECT COUNT(DISTINCT p.id) FROM productos p
        LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
        WHERE p.estado IN ('DISPONIBLE', 'SIN_STOCK')
        AND (:nombre IS NULL OR LOWER(p.nombre::varchar) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND (:categoriaId IS NULL OR pc.categoria_id = :categoriaId)
        """,
            nativeQuery = true)
    Page<Producto> buscarActivos(
            @Param("nombre") String nombre,
            @Param("categoriaId") Long categoriaId,
            Pageable pageable
    );
}
