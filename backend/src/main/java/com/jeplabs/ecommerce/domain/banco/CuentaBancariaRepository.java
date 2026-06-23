package com.jeplabs.ecommerce.domain.banco;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CuentaBancariaRepository extends JpaRepository<CuentaBancaria, Long> {
    List<CuentaBancaria> findByActivoTrueOrderByOrdenVisualizacionAsc();
}
