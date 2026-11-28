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

    // Busca productos activos con coincidencia multicampo insensible a tildes y filtro por categorías
    @Query(value = """
        SELECT DISTINCT p.* FROM productos p
        LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
        LEFT JOIN categorias c ON c.id = pc.categoria_id
        WHERE p.estado IN ('DISPONIBLE', 'SIN_STOCK')
        AND (:filtrarCategoria = false OR pc.categoria_id IN (:categoriaIds))
        AND (
            :nombre IS NULL OR :nombre = '' OR
            LOWER(TRANSLATE(CAST(p.nombre AS text), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
            OR LOWER(TRANSLATE(CAST(p.sku AS text), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
            OR LOWER(TRANSLATE(COALESCE(CAST(p.descripcion AS text), ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
            OR LOWER(TRANSLATE(COALESCE(CAST(p.specs AS text), ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
            OR LOWER(TRANSLATE(COALESCE(CAST(c.nombre AS text), ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
        )
        """, nativeQuery = true)
    List<Producto> buscarActivosSinPaginacion(
            @Param("nombre") String nombre,
            @Param("filtrarCategoria") boolean filtrarCategoria,
            @Param("categoriaIds") List<Long> categoriaIds
    );

    // Endpoint admin - lista productos con todos los estados y coincidencia multicampo insensible a tildes
    @Query(value = """
            SELECT DISTINCT p.* FROM productos p
            LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
            LEFT JOIN categorias c ON c.id = pc.categoria_id
            WHERE (:filtrarCategoria = false OR pc.categoria_id IN (:categoriaIds))
            AND (:estado IS NULL OR p.estado = :estado)
            AND (
                :nombre IS NULL OR :nombre = '' OR
                LOWER(TRANSLATE(CAST(p.nombre AS text), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                    LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                OR LOWER(TRANSLATE(CAST(p.sku AS text), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                    LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                OR LOWER(TRANSLATE(COALESCE(CAST(p.descripcion AS text), ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                    LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                OR LOWER(TRANSLATE(COALESCE(CAST(p.specs AS text), ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                    LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                OR LOWER(TRANSLATE(COALESCE(CAST(c.nombre AS text), ''), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
                    LIKE LOWER(TRANSLATE(CONCAT('%', :nombre, '%'), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))
            )
            """, nativeQuery = true)
    List<Producto> buscarTodosAdminSinPaginacion(
            @Param("nombre") String nombre,
            @Param("filtrarCategoria") boolean filtrarCategoria,
            @Param("categoriaIds") List<Long> categoriaIds,
            @Param("estado") String estado
    );
}
