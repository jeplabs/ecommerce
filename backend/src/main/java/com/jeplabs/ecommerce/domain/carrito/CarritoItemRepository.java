package com.jeplabs.ecommerce.domain.carrito;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {

    // Busca un item específico dentro de un carrito
    Optional<CarritoItem> findByCarritoIdAndProductoId(Long carritoId, Long productoId);

    Optional<CarritoItem> findByIdAndCarritoId(Long Id, Long carritoId);
}
