package com.jeplabs.ecommerce.domain.banner;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository repositorio;

    public List<DatosRespuestaBanner> listarVigentes(SeccionBanner seccion) {
        SeccionBanner seccionEfectiva = seccion != null ? seccion : SeccionBanner.HERO_CAROUSEL;
        return repositorio.findVigentesBySeccion(seccionEfectiva, LocalDateTime.now())
                .stream()
                .map(DatosRespuestaBanner::new)
                .toList();
    }

    public List<DatosRespuestaBanner> listarAdmin(SeccionBanner seccion) {
        List<Banner> banners = seccion != null
                ? repositorio.findBySeccionOrderByOrdenAscIdAsc(seccion)
                : repositorio.findAllByOrderBySeccionAscOrdenAscIdAsc();
        return banners.stream()
                .map(DatosRespuestaBanner::new)
                .toList();
    }

    public DatosRespuestaBanner buscarPorId(Long id) {
        return new DatosRespuestaBanner(buscarBanner(id));
    }

    @Transactional
    public DatosRespuestaBanner crear(DatosCrearBanner datos) {
        validarUrls(datos.desktopUrl(), datos.mobileUrl(), datos.linkUrl());
        validarFechas(datos.fechaInicio(), datos.fechaFin());

        SeccionBanner seccion = datos.seccion() != null ? datos.seccion() : SeccionBanner.HERO_CAROUSEL;
        int orden = datos.orden() != null
                ? datos.orden()
                : repositorio.findMaxOrdenBySeccion(seccion) + 1;

        Banner banner = new Banner(datos, orden);
        Banner guardado = repositorio.save(banner);
        return new DatosRespuestaBanner(guardado);
    }

    @Transactional
    public DatosRespuestaBanner actualizar(Long id, DatosActualizarBanner datos) {
        Banner banner = buscarBanner(id);
        validarUrls(datos.desktopUrl(), datos.mobileUrl(), datos.linkUrl());
        validarFechas(datos.fechaInicio(), datos.fechaFin());

        banner.actualizar(datos);
        return new DatosRespuestaBanner(banner);
    }

    @Transactional
    public DatosRespuestaBanner toggleActivo(Long id) {
        Banner banner = buscarBanner(id);
        banner.toggleActivo();
        return new DatosRespuestaBanner(banner);
    }

    @Transactional
    public List<DatosRespuestaBanner> reordenar(DatosReordenarBanners datos) {
        List<Long> ids = datos.bannerIds();
        if (Set.copyOf(ids).size() != ids.size()) {
            throw new IllegalArgumentException("La lista contiene IDs de banner duplicados");
        }

        Map<Long, Banner> bannersPorId = repositorio.findAllById(ids).stream()
                .collect(Collectors.toMap(Banner::getId, Function.identity()));

        if (bannersPorId.size() != ids.size()) {
            throw new IllegalArgumentException("Uno o más banners no existen en el sistema");
        }

        List<DatosRespuestaBanner> resultado = new ArrayList<>(ids.size());
        for (int i = 0; i < ids.size(); i++) {
            Banner banner = bannersPorId.get(ids.get(i));
            banner.cambiarOrden(i + 1);
            resultado.add(new DatosRespuestaBanner(banner));
        }
        return resultado;
    }

    @Transactional
    public void eliminar(Long id) {
        Banner banner = buscarBanner(id);
        repositorio.delete(banner);
    }

    private Banner buscarBanner(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Banner no encontrado con ID: " + id));
    }

    private void validarUrls(String desktopUrl, String mobileUrl, String linkUrl) {
        validarUrlImagen(desktopUrl, "La URL de imagen desktop");
        if (mobileUrl != null && !mobileUrl.isBlank()) {
            validarUrlImagen(mobileUrl, "La URL de imagen mobile");
        }
        if (linkUrl != null && !linkUrl.isBlank()) {
            validarLinkUrl(linkUrl);
        }
    }

    private void validarUrlImagen(String url, String campo) {
        String normalizada = url.trim().toLowerCase(Locale.ROOT);
        if (!normalizada.startsWith("http://") && !normalizada.startsWith("https://")) {
            throw new IllegalArgumentException(campo + " debe iniciar con http:// o https://");
        }
    }

    private void validarLinkUrl(String linkUrl) {
        String normalizada = linkUrl.trim().toLowerCase(Locale.ROOT);
        if (normalizada.startsWith("javascript:")
                || normalizada.startsWith("data:")
                || normalizada.startsWith("vbscript:")) {
            throw new IllegalArgumentException("El enlace de destino contiene un esquema no permitido");
        }
        if (normalizada.contains("://")
                && !normalizada.startsWith("http://")
                && !normalizada.startsWith("https://")) {
            throw new IllegalArgumentException("El enlace de destino debe ser una ruta relativa o iniciar con http:// o https://");
        }
    }

    private void validarFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        if (fechaInicio != null && fechaFin != null && !fechaFin.isAfter(fechaInicio)) {
            throw new IllegalArgumentException("La fecha de fin debe ser posterior a la fecha de inicio");
        }
    }
}
