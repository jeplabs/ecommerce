package com.jeplabs.ecommerce.domain.direccion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Recibe los datos para crear una nueva dirección
public record DatosCrearDireccion(

        @NotBlank(message = "El alias es obligatorio")
        @Size(max = 50, message = "El alias no puede superar 50 caracteres")
        String alias,

        @NotBlank(message = "La calle es obligatoria")
        @Size(max = 255, message = "La calle no puede superar 255 caracteres")
        String direccion,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(max = 100, message = "La ciudad no puede superar 100 caracteres")
        String ciudad,

        @NotBlank(message = "El estado es obligatorio")
        @Size(max = 100, message = "El estado no puede superar 100 caracteres")
        String estado,

        @Size(max = 20, message = "El código postal no puede superar 20 caracteres")
        String codigoPostal,

        @NotBlank(message = "El país es obligatorio")
        @Size(max = 100, message = "El país no puede superar 100 caracteres")
        String pais,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Formato de teléfono inválido")
        String telefono,

        // Instrucciones adicionales o referencias de la dirección
        @Size(max = 500, message = "Las referencias no pueden superar 500 caracteres")
        String referencias,

        // Indica si la direccion sera principal del usuario.
        boolean principal
) {}