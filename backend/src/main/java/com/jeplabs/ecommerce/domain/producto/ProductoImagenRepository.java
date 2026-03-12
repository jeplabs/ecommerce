package com.jeplabs.ecommerce.domain.producto;

import org.springframework.data.jpa.repository.JpaRepository;

// Repositorio básico para gestión de imágenes.
public interface ProductoImagenRepository extends JpaRepository<ProductoImagen, Long> {
}
