package com.jeplabs.ecommerce.domain.orden;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrdenRepository extends JpaRepository<Orden, Long> {

    // Lista órdenes del usuario autenticado
    Page<Orden> findByUsuarioIdOrderByCreadoAtDesc(Long usuarioId, Pageable pageable);

    // Busca una orden específica verificando que pertenezca al usuario
    Optional<Orden> findByIdAndUsuarioId(Long id, Long usuarioId);

    // Admin - lista todas las órdenes con filtro opcional por estado
    @Query("SELECT o FROM Orden o WHERE (:estado IS NULL OR o.estado = :estado) ORDER BY o.creadoAt DESC")
    Page<Orden> buscarTodas(@Param("estado") EstadoOrden estado, Pageable pageable);
}
