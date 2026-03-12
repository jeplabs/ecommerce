package com.jeplabs.ecommerce.domain.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Recibe los datos para crear o actualizar una categoría
public record DatosCrearCategoria(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre,

        Long parentId  // opcional, null = categoría raíz (categoría raíz no tiene padre)
) {}
