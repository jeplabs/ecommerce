package com.jeplabs.ecommerce.domain.producto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record DatosActualizarBusquedaSinonimo(
        @NotBlank(message = "El nombre del grupo es obligatorio")
        @Size(min = 2, max = 100, message = "El nombre del grupo debe tener entre 2 y 100 caracteres")
        String nombreGrupo,

        @NotEmpty(message = "Debe proporcionar la lista de términos")
        @Size(min = 2, message = "Un grupo de sinónimos debe incluir al menos 2 términos")
        List<@NotBlank(message = "Cada término debe contener texto") String> terminos,

        Boolean activo
) {}
