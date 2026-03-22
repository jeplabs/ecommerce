package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

// Recibe una lista de URLs para agregar al producto existente.

public record DatosAgregarImagenes(
        @NotEmpty(message = "Debes enviar al menos una URL de imagen")
        List<String> imagenesUrl
) {}
