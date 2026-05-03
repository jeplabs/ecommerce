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
}