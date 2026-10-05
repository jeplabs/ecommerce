package com.jeplabs.ecommerce.domain.carrito;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    // Busca el carrito activo del usuario
    Optional<Carrito> findByUsuarioIdAndEstado(Long usuarioId, EstadoCarrito estado);

    // Carritos activos que expiran pronto y no han recibido notificación
    @Query("""
            SELECT c FROM Carrito c
            WHERE c.estado = 'ACTIVO'
            AND c.notificacionEnviada = false
            AND c.expiraAt <= :limite
            """)
    List<Carrito> findCarritosParaNotificar(@Param("limite") LocalDateTime limite);

    // Carritos activos que ya expiraron
    @Query("""
            SELECT c FROM Carrito c
            WHERE c.estado = 'ACTIVO'
            AND c.expiraAt <= :ahora
            """)
    List<Carrito> findCarritosExpirados(@Param("ahora") LocalDateTime ahora);

    // Busca el último carrito en un estado específico (ej. EXPIRADO) ordenado por última actualización
    Optional<Carrito> findFirstByUsuarioIdAndEstadoOrderByActualizadoAtDesc(Long usuarioId, EstadoCarrito estado);

    // Purga física de carritos antiguos abandonados o expirados (retención definitiva)
    @org.springframework.data.jpa.repository.Modifying
    @Query("""
            DELETE FROM Carrito c
            WHERE c.estado IN ('EXPIRADO', 'ABANDONADO')
            AND c.actualizadoAt < :limite
            """)
    int purgarCarritosAntiguos(@Param("limite") LocalDateTime limite);
}