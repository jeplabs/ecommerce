package com.jeplabs.ecommerce.domain.categoria;

import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.infra.exceptions.CategoriaEnUsoException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de CategoriaService")
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository repositorio;

    @Mock
    private ProductoRepository productoRepositorio;

    @InjectMocks
    private CategoriaService service;

    private Categoria crearEntidad(Long id, String nombre, Categoria parent) {
        return new Categoria(id, nombre, Categoria.generarSlug(nombre), parent, new ArrayList<>());
    }

    @Nested
    @DisplayName("Crear categoría y generación de slug")
    class CrearTests {

        @Test
        @DisplayName("Debe crear categoría raíz y normalizar slug con acentos y símbolos extremos")
        void crear_raizConAcentosYSimbolos_debeNormalizarSlug() {
            DatosCrearCategoria datos = new DatosCrearCategoria("  Cámaras (Mirrorless)!  ", null);
            when(repositorio.existsBySlug("camaras-mirrorless")).thenReturn(false);
            when(repositorio.save(any(Categoria.class))).thenAnswer(inv -> {
                Categoria c = inv.getArgument(0);
                return new Categoria(10L, c.getNombre(), c.getSlug(), c.getParent(), new ArrayList<>());
            });

            DatosRespuestaCategoria res = service.crear(datos);

            assertThat(res.slug()).isEqualTo("camaras-mirrorless");
            assertThat(res.parentId()).isNull();
            verify(repositorio).save(any(Categoria.class));
        }

        @Test
        @DisplayName("Debe rechazar nombre que solo produce slug vacío")
        void crear_soloSimbolos_debeLanzarIllegalArgument() {
            DatosCrearCategoria datos = new DatosCrearCategoria("+++---", null);

            assertThatThrownBy(() -> service.crear(datos))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("carácter alfanumérico");
        }

        @Test
        @DisplayName("Debe rechazar crear subcategoría que supere los 5 niveles de profundidad")
        void crear_superaProfundidadMaxima_debeLanzarIllegalArgument() {
            Categoria n1 = crearEntidad(1L, "Nivel 1", null);
            Categoria n2 = crearEntidad(2L, "Nivel 2", n1);
            Categoria n3 = crearEntidad(3L, "Nivel 3", n2);
            Categoria n4 = crearEntidad(4L, "Nivel 4", n3);
            Categoria n5 = crearEntidad(5L, "Nivel 5", n4);

            when(repositorio.existsBySlug("nivel-6")).thenReturn(false);
            when(repositorio.findById(5L)).thenReturn(Optional.of(n5));

            assertThatThrownBy(() -> service.crear(new DatosCrearCategoria("Nivel 6", 5L)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("5 niveles de profundidad");
        }
    }

    @Nested
    @DisplayName("Búsquedas por ID y Slug")
    class BusquedaTests {

        @Test
        @DisplayName("Debe lanzar NoSuchElementException cuando no existe el ID")
        void buscarPorId_inexistente_debeLanzarNoSuchElement() {
            when(repositorio.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscarPorId(99L))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessageContaining("99");
        }

        @Test
        @DisplayName("Debe lanzar NoSuchElementException cuando no existe el slug")
        void buscarPorSlug_inexistente_debeLanzarNoSuchElement() {
            when(repositorio.findBySlug("inexistente")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.buscarPorSlug("inexistente"))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessageContaining("inexistente");
        }
    }

    @Nested
    @DisplayName("Actualizar categoría, prevención de ciclos y profundidad")
    class ActualizarTests {

        @Test
        @DisplayName("Debe rechazar ciclo directo (categoría como su propio padre)")
        void actualizar_autoReferencia_debeLanzarIllegalArgument() {
            Categoria cat = crearEntidad(1L, "Computación", null);
            when(repositorio.findById(1L)).thenReturn(Optional.of(cat));

            assertThatThrownBy(() -> service.actualizar(1L, new DatosCrearCategoria("Computación", 1L)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("propio padre");
        }

        @Test
        @DisplayName("Debe rechazar ciclo transitivo (asignar nieta como padre de su abuela)")
        void actualizar_cicloTransitivo_debeLanzarIllegalArgument() {
            Categoria abuela = crearEntidad(1L, "Computación", null);
            Categoria madre = crearEntidad(2L, "Laptops", abuela);
            Categoria nieta = crearEntidad(3L, "Laptops Gamer", madre);

            when(repositorio.findById(1L)).thenReturn(Optional.of(abuela));
            when(repositorio.findById(3L)).thenReturn(Optional.of(nieta));

            assertThatThrownBy(() -> service.actualizar(1L, new DatosCrearCategoria("Computación", 3L)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("descendiente");
        }

        @Test
        @DisplayName("Debe rechazar mover rama si la nueva profundidad total excede 5 niveles")
        void actualizar_movimientoSuperaProfundidadMaxima_debeLanzarIllegalArgument() {
            Categoria n1 = crearEntidad(1L, "N1", null);
            Categoria n2 = crearEntidad(2L, "N2", n1);
            Categoria n3 = crearEntidad(3L, "N3", n2);
            Categoria n4 = crearEntidad(4L, "N4", n3); // profundidad 4

            Categoria ramaPadre = crearEntidad(10L, "Rama Padre", null);
            Categoria ramaHija = crearEntidad(11L, "Rama Hija", ramaPadre);
            ramaPadre.getSubcategorias().add(ramaHija); // altura subárbol = 2 -> 4 + 2 = 6 > 5

            when(repositorio.findById(10L)).thenReturn(Optional.of(ramaPadre));
            when(repositorio.findById(4L)).thenReturn(Optional.of(n4));

            assertThatThrownBy(() -> service.actualizar(10L, new DatosCrearCategoria("Rama Padre", 4L)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("5 niveles");
        }

        @Test
        @DisplayName("Debe permitir actualizar nombre y convertir a categoría raíz")
        void actualizar_convertirARaiz_debeActualizar() {
            Categoria padre = crearEntidad(1L, "Tecnología", null);
            Categoria hija = crearEntidad(2L, "Audio", padre);

            when(repositorio.findById(2L)).thenReturn(Optional.of(hija));
            when(repositorio.existsBySlug("audio-pro")).thenReturn(false);

            DatosRespuestaCategoria res = service.actualizar(2L, new DatosCrearCategoria("Audio Pro", null));

            assertThat(res.nombre()).isEqualTo("Audio Pro");
            assertThat(res.slug()).isEqualTo("audio-pro");
            assertThat(res.parentId()).isNull();
        }
    }

    @Nested
    @DisplayName("Eliminar categoría con validaciones de integridad")
    class EliminarTests {

        @Test
        @DisplayName("Debe eliminar categoría hoja sin productos y ejecutar flush")
        void eliminar_hojaSinProductos_debeEliminarYFlush() {
            Categoria categoria = crearEntidad(5L, "Accesorios", null);
            when(repositorio.findById(5L)).thenReturn(Optional.of(categoria));
            when(repositorio.countByParentId(5L)).thenReturn(0L);
            when(productoRepositorio.contarPorCategoriaId(5L)).thenReturn(0L);

            service.eliminar(5L);

            verify(repositorio).delete(categoria);
            verify(repositorio).flush();
        }

        @Test
        @DisplayName("Debe lanzar NoSuchElementException si la categoría a eliminar no existe")
        void eliminar_inexistente_debeLanzarNoSuchElement() {
            when(repositorio.findById(404L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.eliminar(404L))
                    .isInstanceOf(NoSuchElementException.class)
                    .hasMessageContaining("404");

            verify(repositorio, never()).delete(any());
        }

        @Test
        @DisplayName("Debe bloquear eliminación con CategoriaEnUsoException cuando tiene subcategorías")
        void eliminar_conSubcategorias_debeLanzarCategoriaEnUso() {
            Categoria categoria = crearEntidad(1L, "Computación", null);
            when(repositorio.findById(1L)).thenReturn(Optional.of(categoria));
            when(repositorio.countByParentId(1L)).thenReturn(3L);

            assertThatThrownBy(() -> service.eliminar(1L))
                    .isInstanceOf(CategoriaEnUsoException.class)
                    .satisfies(ex -> {
                        CategoriaEnUsoException ce = (CategoriaEnUsoException) ex;
                        assertThat(ce.getCodigo()).isEqualTo(CategoriaEnUsoException.CODIGO_CON_SUBCATEGORIAS);
                        assertThat(ce.getMessage()).contains("3 subcategorías");
                    });

            verify(productoRepositorio, never()).contarPorCategoriaId(any());
            verify(repositorio, never()).delete(any());
        }

        @Test
        @DisplayName("Debe bloquear eliminación con CategoriaEnUsoException cuando tiene productos asociados")
        void eliminar_conProductos_debeLanzarCategoriaEnUso() {
            Categoria categoria = crearEntidad(2L, "Laptops", null);
            when(repositorio.findById(2L)).thenReturn(Optional.of(categoria));
            when(repositorio.countByParentId(2L)).thenReturn(0L);
            when(productoRepositorio.contarPorCategoriaId(2L)).thenReturn(1L);

            assertThatThrownBy(() -> service.eliminar(2L))
                    .isInstanceOf(CategoriaEnUsoException.class)
                    .satisfies(ex -> {
                        CategoriaEnUsoException ce = (CategoriaEnUsoException) ex;
                        assertThat(ce.getCodigo()).isEqualTo(CategoriaEnUsoException.CODIGO_CON_PRODUCTOS);
                        assertThat(ce.getMessage()).contains("1 producto asociado");
                    });

            verify(repositorio, never()).delete(any());
        }
    }
}
