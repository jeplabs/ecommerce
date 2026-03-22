package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.Map;

// Recibe todos los datos necesarios para crear un producto incluyendo precio inicial e imágenes.
// Las categorías se reciben como lista de IDs.
public record DatosCrearProducto(

        @NotBlank(message = "El SKU es obligatorio")
        String sku,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 255, message = "El nombre debe tener entre 2 y 255 caracteres")
        String nombre,

        String descripcion,
        Map<String, Object> specs,

        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock,

        @NotNull(message = "El precio es obligatorio")
        @Valid
        DatosPrecio precio,

        @NotEmpty(message = "Debe pertenecer al menos a una categoría")
        List<Long> categoriaIds,

        List<String> imagenesUrl
) {}