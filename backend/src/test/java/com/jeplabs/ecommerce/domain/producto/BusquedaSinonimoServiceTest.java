package com.jeplabs.ecommerce.domain.producto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de BusquedaSinonimoService")
class BusquedaSinonimoServiceTest {

    @Mock
    private BusquedaSinonimoRepository repositorio;

    @InjectMocks
    private BusquedaSinonimoService service;

    private BusquedaSinonimo entidad(Long id, String grupo, String terminos, boolean activo) {
        LocalDateTime now = LocalDateTime.now();
        return new BusquedaSinonimo(id, grupo, terminos, activo, now, now);
    }

    @Nested
    @DisplayName("Caché en memoria e invalidación")
    class CacheTests {

        @Test
        @DisplayName("Cachea el mapa simétrico y solo consulta BD una vez hasta que se invalida")
        void obtenerMapaSinonimos_cacheYInvalidacion() {
            when(repositorio.findByActivoTrueOrderByNombreGrupoAsc())
                    .thenReturn(List.of(entidad(1L, "laptops", "laptop,notebook,portatil", true)));

            Map<String, Set<String>> primera = service.obtenerMapaSinonimos();
            Map<String, Set<String>> segunda = service.obtenerMapaSinonimos();

            assertThat(primera).containsKey("laptop").containsKey("notebook").containsKey("portatil");
            assertThat(primera.get("laptop")).containsExactlyInAnyOrder("notebook", "portatil");
            assertThat(segunda).isSameAs(primera);
            verify(repositorio, times(1)).findByActivoTrueOrderByNombreGrupoAsc();

            // Al crear un nuevo grupo, debe invalidar caché y recargar en la siguiente consulta
            when(repositorio.existsByNombreGrupoIgnoreCase("ratones")).thenReturn(false);
            when(repositorio.save(any())).thenReturn(entidad(2L, "ratones", "raton,mouse", true));
            service.crear(new DatosCrearBusquedaSinonimo("ratones", List.of("Ratón", "Mouse"), true));

            when(repositorio.findByActivoTrueOrderByNombreGrupoAsc()).thenReturn(List.of(
                    entidad(1L, "laptops", "laptop,notebook,portatil", true),
                    entidad(2L, "ratones", "raton,mouse", true)
            ));

            Map<String, Set<String>> recargado = service.obtenerMapaSinonimos();
            assertThat(recargado.get("raton")).contains("mouse");
            verify(repositorio, times(2)).findByActivoTrueOrderByNombreGrupoAsc();
        }
    }

    @Nested
    @DisplayName("Validaciones CRUD")
    class CrudTests {

        @Test
        @DisplayName("Normaliza tildes y deduplica términos al crear")
        void crear_normalizaTerminos() {
            when(repositorio.existsByNombreGrupoIgnoreCase("monitores")).thenReturn(false);
            when(repositorio.save(any())).thenAnswer(inv -> {
                BusquedaSinonimo b = inv.getArgument(0);
                return entidad(5L, b.getNombreGrupo(), b.getTerminos(), b.isActivo());
            });

            DatosRespuestaBusquedaSinonimo res = service.crear(
                    new DatosCrearBusquedaSinonimo(" monitores ", List.of("Pantalla", "Monitor", "pantalla"), null));

            assertThat(res.nombreGrupo()).isEqualTo("monitores");
            assertThat(res.terminos()).containsExactly("pantalla", "monitor");
            assertThat(res.activo()).isTrue();
        }

        @Test
        @DisplayName("Rechaza crear grupo con menos de 2 términos válidos distintos")
        void crear_terminosDuplicados_lanzaIllegalArgument() {
            when(repositorio.existsByNombreGrupoIgnoreCase("duplicado")).thenReturn(false);

            assertThatThrownBy(() -> service.crear(
                    new DatosCrearBusquedaSinonimo("duplicado", List.of("Ratón", "raton"), true)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("al menos 2 términos");
        }

        @Test
        @DisplayName("Rechaza nombre de grupo duplicado")
        void crear_nombreDuplicado_lanzaIllegalArgument() {
            when(repositorio.existsByNombreGrupoIgnoreCase("laptops")).thenReturn(true);

            assertThatThrownBy(() -> service.crear(
                    new DatosCrearBusquedaSinonimo("laptops", List.of("laptop", "notebook"), true)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Ya existe un grupo");
        }

        @Test
        @DisplayName("Lanza NoSuchElementException al eliminar grupo inexistente")
        void eliminar_inexistente_lanzaNoSuchElement() {
            when(repositorio.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.eliminar(99L))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessageContaining("99");
        }
    }
}
