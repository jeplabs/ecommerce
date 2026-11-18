package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.Categoria;
import com.jeplabs.ecommerce.domain.categoria.CategoriaRepository;
import com.jeplabs.ecommerce.infra.config.MonedaConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de ProductoService")
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepositorio;

    @Mock
    private PrecioHistorialRepository precioRepositorio;

    @Mock
    private ProductoImagenRepository imagenRepositorio;

    @Mock
    private CategoriaRepository categoriaRepositorio;

    @Mock
    private MonedaConfig monedaConfig;

    @InjectMocks
    private ProductoService productoService;

    private Producto productoOculto;
    private Producto productoDescontinuado;
    private Categoria categoriaElectronica;
    private ProductoImagen imagenPrincipal;

    @BeforeEach
    void setUp() {
        categoriaElectronica = new Categoria(
                10L, "Electrónica", "electronica", null, new ArrayList<>()
        );

        List<PrecioHistorial> precios = new ArrayList<>();
        List<ProductoImagen> imagenes = new ArrayList<>();

        productoOculto = new Producto(
                1L,
                "SKU-LAP-001",
                "Laptop Pro 16",
                "laptop-pro-16",
                "Laptop de alto rendimiento",
                Map.of("ram", "32GB", "cpu", "M3"),
                5,
                EstadoProducto.OCULTO,
                1,
                LocalDateTime.now(),
                LocalDateTime.now(),
                List.of(categoriaElectronica),
                precios,
                imagenes
        );

        PrecioHistorial precioOculto = new PrecioHistorial(
                100L, productoOculto, new BigDecimal("1500.00"), new BigDecimal("1000.00"),
                "GTQ", LocalDateTime.now(), null
        );
        precios.add(precioOculto);

        imagenPrincipal = new ProductoImagen(200L, productoOculto, "https://cdn.example.com/laptop.jpg", true);
        imagenes.add(imagenPrincipal);

        List<PrecioHistorial> preciosDesc = new ArrayList<>();
        productoDescontinuado = new Producto(
                2L,
                "SKU-MON-002",
                "Monitor Antiguo",
                "monitor-antiguo",
                "Monitor descontinuado",
                Map.of("resolucion", "1080p"),
                0,
                EstadoProducto.DESCONTINUADO,
                1,
                LocalDateTime.now(),
                LocalDateTime.now(),
                List.of(categoriaElectronica),
                preciosDesc,
                new ArrayList<>()
        );
        preciosDesc.add(new PrecioHistorial(
                101L, productoDescontinuado, new BigDecimal("200.00"), new BigDecimal("120.00"),
                "GTQ", LocalDateTime.now(), null
        ));
    }

    @Nested
    @DisplayName("listarAdmin")
    class ListarAdminTests {

        @Test
        @DisplayName("Normaliza cadenas vacías o con solo espacios a null")
        void listarAdmin_conNombreEnBlanco_pasaNullAlRepositorio() {
            Pageable pageable = PageRequest.of(0, 10);
            when(productoRepositorio.buscarTodosAdmin(null, null, null, pageable))
                    .thenReturn(new PageImpl<>(List.of(productoOculto), pageable, 1));

            Page<DatosRespuestaProductoAdmin> resultado = productoService.listarAdmin("   ", null, null, pageable);

            verify(productoRepositorio).buscarTodosAdmin(null, null, null, pageable);
            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).descripcion()).isEqualTo("Laptop de alto rendimiento");
            assertThat(resultado.getContent().get(0).specs()).containsEntry("ram", "32GB");
            assertThat(resultado.getContent().get(0).categorias()).hasSize(1);
        }

        @Test
        @DisplayName("Recorta espacios alrededor del término de búsqueda (nombre o SKU)")
        void listarAdmin_conNombreConEspacios_trimeaElFiltro() {
            Pageable pageable = PageRequest.of(0, 10);
            when(productoRepositorio.buscarTodosAdmin("SKU-LAP", 10L, "OCULTO", pageable))
                    .thenReturn(new PageImpl<>(List.of(productoOculto), pageable, 1));

            Page<DatosRespuestaProductoAdmin> resultado = productoService.listarAdmin(
                    "  SKU-LAP  ", 10L, EstadoProducto.OCULTO, pageable);

            verify(productoRepositorio).buscarTodosAdmin("SKU-LAP", 10L, "OCULTO", pageable);
            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).sku()).isEqualTo("SKU-LAP-001");
        }
    }

    @Nested
    @DisplayName("buscarAdminPorId")
    class BuscarAdminPorIdTests {

        @Test
        @DisplayName("Devuelve descripción, specs y categorías para producto OCULTO")
        void buscarAdminPorId_productoOculto_retornaCamposCompletos() {
            when(productoRepositorio.findById(1L)).thenReturn(Optional.of(productoOculto));

            DatosRespuestaProductoAdmin respuesta = productoService.buscarAdminPorId(1L);

            assertThat(respuesta.id()).isEqualTo(1L);
            assertThat(respuesta.estado()).isEqualTo(EstadoProducto.OCULTO);
            assertThat(respuesta.descripcion()).isEqualTo("Laptop de alto rendimiento");
            assertThat(respuesta.specs()).containsExactlyInAnyOrderEntriesOf(Map.of("ram", "32GB", "cpu", "M3"));
            assertThat(respuesta.categorias()).hasSize(1);
            assertThat(respuesta.categorias().get(0).nombre()).isEqualTo("Electrónica");
            assertThat(respuesta.imagenes()).hasSize(1);
        }

        @Test
        @DisplayName("Devuelve descripción, specs y categorías para producto DESCONTINUADO")
        void buscarAdminPorId_productoDescontinuado_retornaCamposCompletos() {
            when(productoRepositorio.findById(2L)).thenReturn(Optional.of(productoDescontinuado));

            DatosRespuestaProductoAdmin respuesta = productoService.buscarAdminPorId(2L);

            assertThat(respuesta.id()).isEqualTo(2L);
            assertThat(respuesta.estado()).isEqualTo(EstadoProducto.DESCONTINUADO);
            assertThat(respuesta.descripcion()).isEqualTo("Monitor descontinuado");
            assertThat(respuesta.specs()).containsEntry("resolucion", "1080p");
            assertThat(respuesta.categorias()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("listarImagenesAdmin")
    class ListarImagenesAdminTests {

        @Test
        @DisplayName("Retorna imágenes de un producto OCULTO sin fallar por estado")
        void listarImagenesAdmin_productoOculto_retornaImagenes() {
            when(productoRepositorio.findById(1L)).thenReturn(Optional.of(productoOculto));
            when(imagenRepositorio.findByProductoIdOrderByPrincipalDesc(1L))
                    .thenReturn(List.of(imagenPrincipal));

            List<DatosRespuestaImagen> imagenes = productoService.listarImagenesAdmin(1L);

            assertThat(imagenes).hasSize(1);
            assertThat(imagenes.get(0).url()).isEqualTo("https://cdn.example.com/laptop.jpg");
            assertThat(imagenes.get(0).principal()).isTrue();
        }

        @Test
        @DisplayName("Mantiene listarImagenes público rechazando productos OCULTO")
        void listarImagenes_productoOculto_lanzaExcepcion() {
            when(productoRepositorio.findById(1L)).thenReturn(Optional.of(productoOculto));

            assertThatThrownBy(() -> productoService.listarImagenes(1L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Producto no encontrado");
        }
    }
}
