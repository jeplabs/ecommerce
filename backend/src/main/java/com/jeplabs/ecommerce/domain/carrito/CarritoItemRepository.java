package com.jeplabs.ecommerce.domain.carrito;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {

    // Busca un item específico dentro de un carrito
    Optional<CarritoItem> findByCarritoIdAndProductoId(Long carritoId, Long productoId);

    Optional<CarritoItem> findByIdAndCarritoId(Long Id, Long carritoId);

    // Purga física de ítems de carritos antiguos antes de eliminar los carritos padre (integridad referencial)
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("""
            DELETE FROM CarritoItem ci
            WHERE ci.carrito.id IN (
                SELECT c.id FROM Carrito c
                WHERE c.estado IN ('EXPIRADO', 'ABANDONADO')
                AND c.actualizadoAt < :limite
            )
            """)
    int purgarItemsDeCarritosAntiguos(@org.springframework.data.repository.query.Param("limite") java.time.LocalDateTime limite);
}
