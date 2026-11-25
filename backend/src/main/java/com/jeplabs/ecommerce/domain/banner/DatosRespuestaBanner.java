package com.jeplabs.ecommerce.domain.banner;

import java.time.LocalDateTime;

public record DatosRespuestaBanner(
        Long id,
        SeccionBanner seccion,
        String titulo,
        String desktopUrl,
        String mobileUrl,
        String linkUrl,
        Integer orden,
        boolean activo,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public DatosRespuestaBanner(Banner banner) {
        this(
                banner.getId(),
                banner.getSeccion(),
                banner.getTitulo(),
                banner.getDesktopUrl(),
                banner.getMobileUrl(),
                banner.getLinkUrl(),
                banner.getOrden(),
                banner.isActivo(),
                banner.getFechaInicio(),
                banner.getFechaFin(),
                banner.getCreatedAt(),
                banner.getUpdatedAt()
        );
    }
}
