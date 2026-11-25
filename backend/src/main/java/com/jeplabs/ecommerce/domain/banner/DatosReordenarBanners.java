package com.jeplabs.ecommerce.domain.banner;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DatosReordenarBanners(
        @NotEmpty(message = "La lista de IDs de banners no puede estar vacía")
        List<@NotNull(message = "Los IDs de banner no pueden ser nulos") Long> bannerIds
) {}
