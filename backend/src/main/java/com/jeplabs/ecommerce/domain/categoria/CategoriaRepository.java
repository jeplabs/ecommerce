package com.jeplabs.ecommerce.domain.categoria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    // Devuelve solo las categorías raíz, desde las cuales se construye el árbol completo
    List<Categoria> findByParentIsNull();
    Optional<Categoria> findBySlug(String slug);
    // Verifica duplicados antes de crear
    boolean existsBySlug(String slug);
}
