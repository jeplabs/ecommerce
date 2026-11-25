package com.jeplabs.ecommerce.domain.banner;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SeccionBanner seccion;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(name = "desktop_url", nullable = false, length = 500)
    private String desktopUrl;

    @Column(name = "mobile_url", length = 500)
    private String mobileUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(nullable = false)
    private Integer orden;

    @Column(nullable = false)
    private boolean activo;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Banner(DatosCrearBanner datos, int ordenAsignado) {
        LocalDateTime ahora = LocalDateTime.now();
        this.seccion = datos.seccion() != null ? datos.seccion() : SeccionBanner.HERO_CAROUSEL;
        this.titulo = datos.titulo().trim();
        this.desktopUrl = datos.desktopUrl().trim();
        this.mobileUrl = normalizarOpcional(datos.mobileUrl());
        this.linkUrl = normalizarOpcional(datos.linkUrl());
        this.orden = ordenAsignado;
        this.activo = datos.activo() != null ? datos.activo() : true;
        this.fechaInicio = datos.fechaInicio();
        this.fechaFin = datos.fechaFin();
        this.createdAt = ahora;
        this.updatedAt = ahora;
    }

    public void actualizar(DatosActualizarBanner datos) {
        if (datos.seccion() != null) {
            this.seccion = datos.seccion();
        }
        this.titulo = datos.titulo().trim();
        this.desktopUrl = datos.desktopUrl().trim();
        this.mobileUrl = normalizarOpcional(datos.mobileUrl());
        this.linkUrl = normalizarOpcional(datos.linkUrl());
        if (datos.orden() != null) {
            this.orden = datos.orden();
        }
        if (datos.activo() != null) {
            this.activo = datos.activo();
        }
        this.fechaInicio = datos.fechaInicio();
        this.fechaFin = datos.fechaFin();
        this.updatedAt = LocalDateTime.now();
    }

    public void toggleActivo() {
        this.activo = !this.activo;
        this.updatedAt = LocalDateTime.now();
    }

    public void cambiarOrden(int nuevoOrden) {
        this.orden = nuevoOrden;
        this.updatedAt = LocalDateTime.now();
    }

    private static String normalizarOpcional(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }
}
