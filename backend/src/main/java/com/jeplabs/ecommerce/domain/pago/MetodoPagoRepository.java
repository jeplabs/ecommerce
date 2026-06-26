package com.jeplabs.ecommerce.domain.pago;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
    List<MetodoPago> findByActivoTrueOrderByOrdenVisualizacionAsc();
    Optional<MetodoPago> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
}