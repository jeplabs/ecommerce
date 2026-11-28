package com.jeplabs.ecommerce.domain.producto;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BusquedaSinonimoRepository extends JpaRepository<BusquedaSinonimo, Long> {

    List<BusquedaSinonimo> findByActivoTrueOrderByNombreGrupoAsc();

    List<BusquedaSinonimo> findAllByOrderByNombreGrupoAsc();

    boolean existsByNombreGrupoIgnoreCase(String nombreGrupo);

    boolean existsByNombreGrupoIgnoreCaseAndIdNot(String nombreGrupo, Long id);
}
