package com.jeplabs.ecommerce.domain.banner;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record DatosCrearBanner(
        SeccionBanner seccion,

        @NotBlank(message = "El título del banner es obligatorio")
        @Size(max = 150, message = "El título no puede superar 150 caracteres")
        String titulo,

        @NotBlank(message = "La URL de imagen desktop es obligatoria")
        @Size(max = 500, message = "La URL desktop no puede superar 500 caracteres")
        String desktopUrl,

        @Size(max = 500, message = "La URL mobile no puede superar 500 caracteres")
        String mobileUrl,

        @Size(max = 500, message = "El enlace de destino no puede superar 500 caracteres")
        String linkUrl,

        @Min(value = 1, message = "El orden mínimo es 1")
        Integer orden,

        Boolean activo,

        LocalDateTime fechaInicio,

        LocalDateTime fechaFin
) {}
