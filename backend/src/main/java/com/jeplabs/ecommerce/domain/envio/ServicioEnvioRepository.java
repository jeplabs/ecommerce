package com.jeplabs.ecommerce.domain.envio;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicioEnvioRepository extends JpaRepository<ServicioEnvio, Long> {

    List<ServicioEnvio> findByActivoTrue();

    List<ServicioEnvio> findByActivoTrueOrderByIdAsc();
}
