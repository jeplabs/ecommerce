package com.jeplabs.ecommerce.domain.sucursal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {

    List<Sucursal> findByActivoTrueOrderByOrdenVisualizacionAscIdAsc();

    List<Sucursal> findAllByOrderByOrdenVisualizacionAscIdAsc();

    Optional<Sucursal> findByIdAndActivoTrue(Long id);
}
