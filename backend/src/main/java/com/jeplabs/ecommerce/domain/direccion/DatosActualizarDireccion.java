package com.jeplabs.ecommerce.domain.direccion;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Todos los datos son opcionales porque es PATCH
public record DatosActualizarDireccion(

        @Size(max = 50, message = "El alias no puede superar 50 caracteres")
        String alias,

        @Size(max = 255, message = "La calle no puede superar 255 caracteres")
        String calle,

        @Size(max = 100, message = "La ciudad no puede superar 100 caracteres")
        String ciudad,

        @Size(max = 100, message = "El estado no puede superar 100 caracteres")
        String estado,

        @Size(max = 20, message = "El código postal no puede superar 20 caracteres")
        String codigoPostal,

        @Size(max = 100, message = "El país no puede superar 100 caracteres")
        String pais,

        @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Formato de teléfono inválido")
        String telefono,

        @Size(max = 500, message = "Las referencias no pueden superar 500 caracteres")
        String referencias
) {}