package com.jeplabs.ecommerce.domain.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Por medio de JPA, Spring genera toda la implementación SQL automaticamente.
// findByEmail y existsByEmail, se usan sin necesidad de escribir ninguna query.
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}