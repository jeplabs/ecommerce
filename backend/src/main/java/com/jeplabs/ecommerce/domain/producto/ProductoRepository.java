package com.jeplabs.ecommerce.domain.producto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

// Incluye métodos para búsqueda por SKU, slug y filtros.
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findBySku(String sku);
    Optional<Producto> findBySlug(String slug);
    boolean existsBySku(String sku);
    boolean existsBySlug(String slug);

    @Query("SELECT COUNT(p) FROM Producto p JOIN p.categorias c WHERE c.id = :categoriaId")
    long contarPorCategoriaId(@Param("categoriaId") Long categoriaId);

    // Busca productos activos con filtro opcional por nombre y lista de categorías (el ordenamiento lo aplica ProductoService)
    @Query(value = """
        SELECT DISTINCT p.* FROM productos p
        LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
        WHERE p.estado IN ('DISPONIBLE', 'SIN_STOCK')
        AND (:nombre IS NULL OR LOWER(p.nombre::varchar) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND (:filtrarCategoria = false OR pc.categoria_id IN (:categoriaIds))
        """, nativeQuery = true)
    List<Producto> buscarActivosSinPaginacion(
            @Param("nombre") String nombre,
            @Param("filtrarCategoria") boolean filtrarCategoria,
            @Param("categoriaIds") List<Long> categoriaIds
    );

    // Endpoint admin - lista productos con todos los estados (el ordenamiento lo aplica ProductoService)
    @Query(value = """
            SELECT DISTINCT p.* FROM productos p
            LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
            WHERE (:nombre IS NULL
                OR LOWER(p.nombre::varchar) LIKE LOWER(CONCAT('%', :nombre, '%'))
                OR LOWER(p.sku::varchar) LIKE LOWER(CONCAT('%', :nombre, '%')))
            AND (:filtrarCategoria = false OR pc.categoria_id IN (:categoriaIds))
            AND (:estado IS NULL OR p.estado = :estado)
            """, nativeQuery = true)
    List<Producto> buscarTodosAdminSinPaginacion(
            @Param("nombre") String nombre,
            @Param("filtrarCategoria") boolean filtrarCategoria,
            @Param("categoriaIds") List<Long> categoriaIds,
            @Param("estado") String estado
    );
}
