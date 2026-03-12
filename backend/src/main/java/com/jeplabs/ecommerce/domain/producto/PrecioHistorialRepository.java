package com.jeplabs.ecommerce.domain.producto;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Busca el precio activo de un producto por su fechaFin nula.
public interface PrecioHistorialRepository extends JpaRepository<PrecioHistorial, Long> {
    Optional<PrecioHistorial> findByProductoIdAndFechaFinIsNull(Long productoId);
}
