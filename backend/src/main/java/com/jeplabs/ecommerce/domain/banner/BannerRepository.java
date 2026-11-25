package com.jeplabs.ecommerce.domain.banner;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    @Query("""
            SELECT b FROM Banner b
            WHERE b.seccion = :seccion
              AND b.activo = true
              AND (b.fechaInicio IS NULL OR b.fechaInicio <= :ahora)
              AND (b.fechaFin IS NULL OR b.fechaFin >= :ahora)
            ORDER BY b.orden ASC, b.id ASC
            """)
    List<Banner> findVigentesBySeccion(
            @Param("seccion") SeccionBanner seccion,
            @Param("ahora") LocalDateTime ahora);

    List<Banner> findBySeccionOrderByOrdenAscIdAsc(SeccionBanner seccion);

    List<Banner> findAllByOrderBySeccionAscOrdenAscIdAsc();

    @Query("SELECT COALESCE(MAX(b.orden), 0) FROM Banner b WHERE b.seccion = :seccion")
    int findMaxOrdenBySeccion(@Param("seccion") SeccionBanner seccion);
}
