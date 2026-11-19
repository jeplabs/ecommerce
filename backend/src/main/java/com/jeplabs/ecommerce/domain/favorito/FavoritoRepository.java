package com.jeplabs.ecommerce.domain.favorito;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoritoRepository extends JpaRepository<Favorito, FavoritoId> {

    @EntityGraph(attributePaths = {"producto"})
    Page<Favorito> findByUsuarioId(Long usuarioId, Pageable pageable);

    @Query("SELECT f.id.productoId FROM Favorito f WHERE f.id.usuarioId = :usuarioId ORDER BY f.creadoAt DESC")
    List<Long> findProductoIdsByUsuarioId(@Param("usuarioId") Long usuarioId);

    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    void deleteByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
}
