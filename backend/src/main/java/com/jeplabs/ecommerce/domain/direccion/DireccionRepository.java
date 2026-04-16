package com.jeplabs.ecommerce.domain.direccion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    // Lista solo direcciones activas del usuario, principal siempre primero
    List<Direccion> findByUsuarioIdAndActivoTrueOrderByPrincipalDesc(Long usuarioId);

    // Busca una dirección específica verificando que pertenezca al usuario
    Optional<Direccion> findByIdAndUsuarioId(Long id, Long usuarioId);

    // Quita el flag principal de todas las direcciones del usuario
    @Modifying
    @Query("UPDATE Direccion d SET d.principal = false WHERE d.usuario.id = :usuarioId")
    void resetearPrincipal(@Param("usuarioId") Long usuarioId);

    // Verifica si el usuario tiene al menos una dirección activa
    boolean existsByUsuarioIdAndActivoTrue(Long usuarioId);
}