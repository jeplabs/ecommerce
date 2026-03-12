package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

// Todos los campos son opcionales porque con PATCH solo se actualizan los campos enviados.
public record DatosActualizarProducto(

        @Size(min = 2, max = 255, message = "El nombre debe tener entre 2 y 255 caracteres")
        String nombre,

        String descripcion,
        Map<String, Object> specs,

        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock,

        List<Long> categoriaIds
) {}
