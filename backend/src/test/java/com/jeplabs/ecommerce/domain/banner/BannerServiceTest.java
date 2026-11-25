package com.jeplabs.ecommerce.domain.banner;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de BannerService")
class BannerServiceTest {

    @Mock
    private BannerRepository repositorio;

    @InjectMocks
    private BannerService bannerService;

    private Banner bannerHero1;
    private Banner bannerHero2;

    @BeforeEach
    void setUp() {
        LocalDateTime ahora = LocalDateTime.now();
        bannerHero1 = new Banner(
                1L,
                SeccionBanner.HERO_CAROUSEL,
                "Promoción de verano",
                "https://res.cloudinary.com/demo/image/upload/banner1-desktop.webp",
                "https://res.cloudinary.com/demo/image/upload/banner1-mobile.webp",
                "/categoria/audio",
                1,
                true,
                ahora.minusDays(1),
                ahora.plusDays(10),
                ahora.minusDays(2),
                ahora.minusDays(1)
        );

        bannerHero2 = new Banner(
                2L,
                SeccionBanner.HERO_CAROUSEL,
                "Envío gratis",
                "https://res.cloudinary.com/demo/image/upload/banner2-desktop.webp",
                null,
                "https://ejemplo.com/promo",
                2,
                false,
                null,
                null,
                ahora.minusDays(2),
                ahora.minusDays(1)
        );
    }

    @Nested
    @DisplayName("Listar banners")
    class ListarTests {

        @Test
        @DisplayName("listarVigentes usa HERO_CAROUSEL por defecto cuando seccion es null")
        void listarVigentes_seccionNull_usaHeroCarousel() {
            when(repositorio.findVigentesBySeccion(eq(SeccionBanner.HERO_CAROUSEL), any(LocalDateTime.class)))
                    .thenReturn(List.of(bannerHero1));

            List<DatosRespuestaBanner> resultado = bannerService.listarVigentes(null);

            assertThat(resultado).hasSize(1);
            assertThat(resultado.get(0).titulo()).isEqualTo("Promoción de verano");
            verify(repositorio).findVigentesBySeccion(eq(SeccionBanner.HERO_CAROUSEL), any(LocalDateTime.class));
        }

        @Test
        @DisplayName("listarAdmin sin filtro retorna todos los banners")
        void listarAdmin_sinFiltro_retornaTodos() {
            when(repositorio.findAllByOrderBySeccionAscOrdenAscIdAsc())
                    .thenReturn(List.of(bannerHero1, bannerHero2));

            List<DatosRespuestaBanner> resultado = bannerService.listarAdmin(null);

            assertThat(resultado).hasSize(2);
            verify(repositorio).findAllByOrderBySeccionAscOrdenAscIdAsc();
        }

        @Test
        @DisplayName("listarAdmin con sección filtra por la sección indicada")
        void listarAdmin_conSeccion_filtraPorSeccion() {
            when(repositorio.findBySeccionOrderByOrdenAscIdAsc(SeccionBanner.HERO_CAROUSEL))
                    .thenReturn(List.of(bannerHero1, bannerHero2));

            List<DatosRespuestaBanner> resultado = bannerService.listarAdmin(SeccionBanner.HERO_CAROUSEL);

            assertThat(resultado).hasSize(2);
            verify(repositorio).findBySeccionOrderByOrdenAscIdAsc(SeccionBanner.HERO_CAROUSEL);
        }

        @Test
        @DisplayName("buscarPorId lanza NoSuchElementException cuando no existe")
        void buscarPorId_noExiste_lanzaExcepcion() {
            when(repositorio.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bannerService.buscarPorId(99L))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessage("Banner no encontrado con ID: 99");
        }
    }

    @Nested
    @DisplayName("Crear y actualizar banners")
    class CrearActualizarTests {

        @Test
        @DisplayName("crear asigna orden automático max + 1 cuando orden es null")
        void crear_sinOrden_asignaMaxMasUno() {
            DatosCrearBanner datos = new DatosCrearBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "Nuevo lanzamiento",
                    "https://res.cloudinary.com/demo/image/upload/nuevo.webp",
                    null,
                    "/catalogo",
                    null,
                    true,
                    null,
                    null
            );

            when(repositorio.findMaxOrdenBySeccion(SeccionBanner.HERO_CAROUSEL)).thenReturn(4);
            when(repositorio.save(any(Banner.class))).thenAnswer(inv -> inv.getArgument(0));

            DatosRespuestaBanner respuesta = bannerService.crear(datos);

            assertThat(respuesta.orden()).isEqualTo(5);
            assertThat(respuesta.activo()).isTrue();
            assertThat(respuesta.seccion()).isEqualTo(SeccionBanner.HERO_CAROUSEL);
            verify(repositorio).save(any(Banner.class));
        }

        @Test
        @DisplayName("crear rechaza fechaFin anterior o igual a fechaInicio")
        void crear_fechasInvalidas_lanzaIllegalArgument() {
            LocalDateTime inicio = LocalDateTime.of(2026, 6, 10, 12, 0);
            LocalDateTime fin = LocalDateTime.of(2026, 6, 10, 12, 0);

            DatosCrearBanner datos = new DatosCrearBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "Promo",
                    "https://res.cloudinary.com/demo/image/upload/p.webp",
                    null,
                    null,
                    1,
                    true,
                    inicio,
                    fin
            );

            assertThatThrownBy(() -> bannerService.crear(datos))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("La fecha de fin debe ser posterior a la fecha de inicio");
            verify(repositorio, never()).save(any());
        }

        @Test
        @DisplayName("crear rechaza URL de imagen sin protocolo http/https")
        void crear_urlImagenInvalida_lanzaIllegalArgument() {
            DatosCrearBanner datos = new DatosCrearBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "Promo",
                    "ftp://servidor/banner.webp",
                    null,
                    null,
                    1,
                    true,
                    null,
                    null
            );

            assertThatThrownBy(() -> bannerService.crear(datos))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("debe iniciar con http:// o https://");
        }

        @Test
        @DisplayName("crear rechaza linkUrl con esquema javascript:")
        void crear_linkUrlPeligroso_lanzaIllegalArgument() {
            DatosCrearBanner datos = new DatosCrearBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "Promo",
                    "https://res.cloudinary.com/demo/image/upload/p.webp",
                    null,
                    "javascript:alert(1)",
                    1,
                    true,
                    null,
                    null
            );

            assertThatThrownBy(() -> bannerService.crear(datos))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("El enlace de destino contiene un esquema no permitido");
        }

        @Test
        @DisplayName("actualizar modifica metadatos y limpia campos opcionales en blanco")
        void actualizar_datosValidos_actualizaYNormalizaOpcionales() {
            when(repositorio.findById(1L)).thenReturn(Optional.of(bannerHero1));

            DatosActualizarBanner datos = new DatosActualizarBanner(
                    SeccionBanner.GRID_PROMO,
                    "Promo actualizada",
                    "https://res.cloudinary.com/demo/image/upload/updated.webp",
                    "   ",
                    "",
                    3,
                    false,
                    null,
                    null
            );

            DatosRespuestaBanner respuesta = bannerService.actualizar(1L, datos);

            assertThat(respuesta.seccion()).isEqualTo(SeccionBanner.GRID_PROMO);
            assertThat(respuesta.titulo()).isEqualTo("Promo actualizada");
            assertThat(respuesta.mobileUrl()).isNull();
            assertThat(respuesta.linkUrl()).isNull();
            assertThat(respuesta.orden()).isEqualTo(3);
            assertThat(respuesta.activo()).isFalse();
            assertThat(respuesta.fechaInicio()).isNull();
            assertThat(respuesta.fechaFin()).isNull();
        }
    }

    @Nested
    @DisplayName("Estado, reordenamiento y eliminación")
    class EstadoReordenEliminarTests {

        @Test
        @DisplayName("toggleActivo invierte el estado actual del banner")
        void toggleActivo_invierteEstado() {
            when(repositorio.findById(1L)).thenReturn(Optional.of(bannerHero1));

            DatosRespuestaBanner respuesta = bannerService.toggleActivo(1L);

            assertThat(respuesta.activo()).isFalse();
        }

        @Test
        @DisplayName("reordenar actualiza orden 1..N según la lista de IDs")
        void reordenar_idsValidos_actualizaOrden() {
            when(repositorio.findAllById(List.of(2L, 1L))).thenReturn(List.of(bannerHero1, bannerHero2));

            List<DatosRespuestaBanner> resultado = bannerService.reordenar(new DatosReordenarBanners(List.of(2L, 1L)));

            assertThat(resultado).extracting(DatosRespuestaBanner::id).containsExactly(2L, 1L);
            assertThat(resultado).extracting(DatosRespuestaBanner::orden).containsExactly(1, 2);
        }

        @Test
        @DisplayName("reordenar rechaza IDs duplicados")
        void reordenar_idsDuplicados_lanzaIllegalArgument() {
            assertThatThrownBy(() -> bannerService.reordenar(new DatosReordenarBanners(List.of(1L, 1L))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("La lista contiene IDs de banner duplicados");
        }

        @Test
        @DisplayName("reordenar rechaza IDs inexistentes")
        void reordenar_idInexistente_lanzaIllegalArgument() {
            when(repositorio.findAllById(List.of(1L, 99L))).thenReturn(List.of(bannerHero1));

            assertThatThrownBy(() -> bannerService.reordenar(new DatosReordenarBanners(List.of(1L, 99L))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Uno o más banners no existen en el sistema");
        }

        @Test
        @DisplayName("eliminar ejecuta eliminación física del banner existente")
        void eliminar_bannerExistente_eliminaFisicamente() {
            when(repositorio.findById(1L)).thenReturn(Optional.of(bannerHero1));

            bannerService.eliminar(1L);

            verify(repositorio).delete(bannerHero1);
        }

        @Test
        @DisplayName("eliminar lanza NoSuchElementException cuando el banner no existe")
        void eliminar_bannerInexistente_lanzaExcepcion() {
            when(repositorio.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> bannerService.eliminar(99L))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessage("Banner no encontrado con ID: 99");
        }
    }
}
