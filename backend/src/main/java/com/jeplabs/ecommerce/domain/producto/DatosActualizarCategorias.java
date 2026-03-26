package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

// Recibe la lista de IDs de categorías a agregar o quitar.
public record DatosActualizarCategorias(
        @NotEmpty(message = "Debes enviar al menos una categoría")
        List<Long> categoriaIds
) {}
