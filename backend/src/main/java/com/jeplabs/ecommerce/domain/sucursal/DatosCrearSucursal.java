package com.jeplabs.ecommerce.domain.sucursal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DatosCrearSucursal(

        @NotBlank(message = "El nombre de la sucursal es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @NotBlank(message = "La dirección de la sucursal es obligatoria")
        @Size(max = 255, message = "La dirección no puede superar 255 caracteres")
        String direccion,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(max = 100, message = "La ciudad no puede superar 100 caracteres")
        String ciudad,

        @Size(max = 100, message = "El estado/departamento no puede superar 100 caracteres")
        String estado,

        @Size(max = 20, message = "El código postal no puede superar 20 caracteres")
        String codigoPostal,

        @NotBlank(message = "El país es obligatorio")
        @Size(max = 100, message = "El país no puede superar 100 caracteres")
        String pais,

        @NotBlank(message = "El teléfono es obligatorio")
        @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
        String telefono,

        @NotBlank(message = "El horario es obligatorio")
        @Size(max = 255, message = "El horario no puede superar 255 caracteres")
        String horario,

        @Size(max = 500, message = "Las referencias no pueden superar 500 caracteres")
        String referencias,

        @Size(max = 500, message = "El enlace del mapa no puede superar 500 caracteres")
        String mapaUrl,

        @Min(value = 1, message = "El orden mínimo de visualización es 1")
        Integer ordenVisualizacion
) {}
