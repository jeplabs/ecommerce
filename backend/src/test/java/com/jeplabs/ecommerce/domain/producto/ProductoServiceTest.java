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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.LinkedMultiValueMap;

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

    @Mock
    private BusquedaSinonimoService busquedaSinonimoService;

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
            when(productoRepositorio.buscarTodosAdminSinPaginacion(null, false, List.of(-1L), null))
                    .thenReturn(List.of(productoOculto));

            Page<DatosRespuestaProductoAdmin> resultado = productoService.listarAdmin("   ", null, null, pageable);

            verify(productoRepositorio).buscarTodosAdminSinPaginacion(null, false, List.of(-1L), null);
            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).descripcion()).isEqualTo("Laptop de alto rendimiento");
            assertThat(resultado.getContent().get(0).specs()).containsEntry("ram", "32GB");
            assertThat(resultado.getContent().get(0).categorias()).hasSize(1);
        }

        @Test
        @DisplayName("Recorta espacios alrededor del término de búsqueda e incluye subcategorías")
        void listarAdmin_conNombreConEspacios_trimeaElFiltroEIncluyeSubcategorias() {
            Categoria subcategoria = new Categoria(11L, "Laptops", "laptops", categoriaElectronica, new ArrayList<>());
            categoriaElectronica.getSubcategorias().add(subcategoria);

            Pageable pageable = PageRequest.of(0, 10);
            when(categoriaRepositorio.findById(10L)).thenReturn(Optional.of(categoriaElectronica));
            when(productoRepositorio.buscarTodosAdminSinPaginacion("SKU-LAP", true, List.of(10L, 11L), "OCULTO"))
                    .thenReturn(List.of(productoOculto));

            Page<DatosRespuestaProductoAdmin> resultado = productoService.listarAdmin(
                    "  SKU-LAP  ", 10L, EstadoProducto.OCULTO, pageable);

            verify(productoRepositorio).buscarTodosAdminSinPaginacion("SKU-LAP", true, List.of(10L, 11L), "OCULTO");
            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).sku()).isEqualTo("SKU-LAP-001");
        }

        @Test
        @DisplayName("Ordena globalmente por precioVenta entre múltiples páginas")
        void listarAdmin_ordenPorPrecioAscendente_respetaTodasLasPaginas() {
            Producto productoBarato = crearProductoConPrecio(3L, "SKU-BAR-003", "Cable USB", "25.00", "10.00", 50);
            Producto productoMedio = crearProductoConPrecio(4L, "SKU-MED-004", "Teclado Mecánico", "450.00", "250.00", 15);

            when(productoRepositorio.buscarTodosAdminSinPaginacion(null, false, List.of(-1L), null))
                    .thenReturn(List.of(productoOculto, productoDescontinuado, productoBarato, productoMedio));

            Page<DatosRespuestaProductoAdmin> pagina0 = productoService.listarAdmin(
                    null, null, null, PageRequest.of(0, 2, Sort.by(Sort.Direction.ASC, "precioVenta")));
            Page<DatosRespuestaProductoAdmin> pagina1 = productoService.listarAdmin(
                    null, null, null, PageRequest.of(1, 2, Sort.by(Sort.Direction.ASC, "precioVenta")));

            assertThat(pagina0.getTotalElements()).isEqualTo(4);
            assertThat(pagina0.getTotalPages()).isEqualTo(2);
            assertThat(pagina0.getContent()).extracting(DatosRespuestaProductoAdmin::id).containsExactly(3L, 2L);
            assertThat(pagina1.getContent()).extracting(DatosRespuestaProductoAdmin::id).containsExactly(4L, 1L);
        }

        @Test
        @DisplayName("Soporta búsqueda multicampo multi-palabra en descripción y specs para admin")
        void listarAdmin_busquedaMulticampoSpecsYDescripcion_filtraCorrectamente() {
            when(productoRepositorio.buscarTodosAdminSinPaginacion(null, false, List.of(-1L), null))
                    .thenReturn(List.of(productoOculto, productoDescontinuado));

            Page<DatosRespuestaProductoAdmin> resultado = productoService.listarAdmin(
                    "32gb rendimiento", null, null, PageRequest.of(0, 10));

            verify(productoRepositorio).buscarTodosAdminSinPaginacion(null, false, List.of(-1L), null);
            assertThat(resultado.getContent()).extracting(DatosRespuestaProductoAdmin::id).containsExactly(1L);
        }
    }

    @Nested
    @DisplayName("listarFacetado")
    class ListarFacetadoTests {

        @Test
        @DisplayName("Ordena globalmente por precioVenta ascendente y descendente en todas las páginas")
        void listarFacetado_ordenPorPrecio_aplicaAntesDePaginar() {
            Producto p1 = crearProductoConPrecio(10L, "SKU-10", "Producto A", "500.00", "300.00", 5);
            Producto p2 = crearProductoConPrecio(20L, "SKU-20", "Producto B", "100.00", "50.00", 8);
            Producto p3 = crearProductoConPrecio(30L, "SKU-30", "Producto C", "900.00", "600.00", 3);
            Producto p4 = crearProductoConPrecio(40L, "SKU-40", "Producto D", "250.00", "150.00", 12);

            when(productoRepositorio.buscarActivosSinPaginacion(null, false, List.of(-1L)))
                    .thenReturn(List.of(p1, p2, p3, p4));

            DatosRespuestaCatalogoPage ascP0 = productoService.listarFacetado(
                    null, null, null, null, new LinkedMultiValueMap<>(),
                    PageRequest.of(0, 2, Sort.by(Sort.Direction.ASC, "precioVenta")));
            DatosRespuestaCatalogoPage ascP1 = productoService.listarFacetado(
                    null, null, null, null, new LinkedMultiValueMap<>(),
                    PageRequest.of(1, 2, Sort.by(Sort.Direction.ASC, "precioVenta")));

            assertThat(ascP0.content()).extracting(DatosRespuestaProducto::id).containsExactly(20L, 40L);
            assertThat(ascP1.content()).extracting(DatosRespuestaProducto::id).containsExactly(10L, 30L);

            DatosRespuestaCatalogoPage descP0 = productoService.listarFacetado(
                    null, null, null, null, new LinkedMultiValueMap<>(),
                    PageRequest.of(0, 2, Sort.by(Sort.Direction.DESC, "precioVenta")));

            assertThat(descP0.content()).extracting(DatosRespuestaProducto::id).containsExactly(30L, 10L);
        }

        @Test
        @DisplayName("Incluye productos de subcategorías al filtrar por categoría padre")
        void listarFacetado_categoriaPadre_incluyeSubcategorias() {
            Categoria subcat = new Categoria(11L, "Laptops", "laptops", categoriaElectronica, new ArrayList<>());
            Categoria nieto = new Categoria(12L, "Ultrabooks", "ultrabooks", subcat, new ArrayList<>());
            subcat.getSubcategorias().add(nieto);
            categoriaElectronica.getSubcategorias().add(subcat);

            Producto p = crearProductoConPrecio(10L, "SKU-10", "Ultrabook X", "1200.00", "800.00", 4);

            when(categoriaRepositorio.findById(10L)).thenReturn(Optional.of(categoriaElectronica));
            when(productoRepositorio.buscarActivosSinPaginacion(null, true, List.of(10L, 11L, 12L)))
                    .thenReturn(List.of(p));

            DatosRespuestaCatalogoPage respuesta = productoService.listarFacetado(
                    null, 10L, null, null, new LinkedMultiValueMap<>(),
                    PageRequest.of(0, 12, Sort.by(Sort.Direction.ASC, "precioVenta")));

            verify(productoRepositorio).buscarActivosSinPaginacion(null, true, List.of(10L, 11L, 12L));
            assertThat(respuesta.totalElements()).isEqualTo(1);
            assertThat(respuesta.content()).hasSize(1);
        }

        @Test
        @DisplayName("Retorna página vacía si la categoría solicitada no existe")
        void listarFacetado_categoriaInexistente_retornaVacio() {
            when(categoriaRepositorio.findById(999L)).thenReturn(Optional.empty());

            DatosRespuestaCatalogoPage respuesta = productoService.listarFacetado(
                    null, 999L, null, null, new LinkedMultiValueMap<>(), PageRequest.of(0, 12));

            assertThat(respuesta.totalElements()).isZero();
            assertThat(respuesta.content()).isEmpty();
            verifyNoInteractions(productoRepositorio);
        }

        @Test
        @DisplayName("Expande sinónimos de 1 palabra sin descartar en SQL y ordena por relevancia cuando no hay sort")
        void listarFacetado_conBusquedaSinSort_ordenaPorRelevanciaYUsaSinonimos() {
            Producto notebookDell = crearProductoConPrecio(
                    10L, "U7LNL321TB", "Notebook Dell Ultrabook Pro 14", "1200.00", "900.00", 5);
            Producto accesorioConDesc = new Producto(
                    20L,
                    "ACC-20",
                    "Accesorio Base Enfriadora",
                    "accesorio-base-enfriadora",
                    "Base refrigerante compatible con cualquier laptop moderna",
                    Map.of("Marca", "Cooler"),
                    10,
                    EstadoProducto.DISPONIBLE,
                    1,
                    LocalDateTime.now(),
                    LocalDateTime.now(),
                    List.of(categoriaElectronica),
                    new ArrayList<>(List.of(new PrecioHistorial(
                            200L, null, new BigDecimal("80.00"), new BigDecimal("40.00"),
                            "GTQ", LocalDateTime.now(), null))),
                    new ArrayList<>()
            );

            when(busquedaSinonimoService.obtenerMapaSinonimos()).thenReturn(
                    ProductoBuscador.construirMapaSinonimos(List.of(List.of("laptop", "notebook", "ultrabook"))));
            when(productoRepositorio.buscarActivosSinPaginacion(null, false, List.of(-1L)))
                    .thenReturn(List.of(accesorioConDesc, notebookDell));

            DatosRespuestaCatalogoPage respuesta = productoService.listarFacetado(
                    "laptop", null, null, null, new LinkedMultiValueMap<>(),
                    PageRequest.of(0, 12));

            verify(productoRepositorio).buscarActivosSinPaginacion(null, false, List.of(-1L));
            // Aunque "Accesorio..." iría antes alfabéticamente, "Notebook Dell..." gana por relevancia (nombre > descripción)
            assertThat(respuesta.content()).extracting(DatosRespuestaProducto::id).containsExactly(10L, 20L);
        }

        @Test
        @DisplayName("Respeta sort explícito del usuario incluso cuando hay búsqueda activa")
        void listarFacetado_conBusquedaYSortExplicito_respetaSortDelUsuario() {
            Producto caro = crearProductoConPrecio(10L, "SKU-10", "Notebook Dell Pro", "1500.00", "1000.00", 5);
            Producto barato = crearProductoConPrecio(20L, "SKU-20", "Notebook Asus Basic", "500.00", "350.00", 5);

            when(busquedaSinonimoService.obtenerMapaSinonimos()).thenReturn(
                    ProductoBuscador.construirMapaSinonimos(List.of(List.of("laptop", "notebook"))));
            when(productoRepositorio.buscarActivosSinPaginacion(null, false, List.of(-1L)))
                    .thenReturn(List.of(caro, barato));

            DatosRespuestaCatalogoPage respuesta = productoService.listarFacetado(
                    "laptop", null, null, null, new LinkedMultiValueMap<>(),
                    PageRequest.of(0, 12, Sort.by(Sort.Direction.ASC, "precioVenta")));

            assertThat(respuesta.content()).extracting(DatosRespuestaProducto::id).containsExactly(20L, 10L);
        }
    }

    private Producto crearProductoConPrecio(
            Long id, String sku, String nombre, String precioVenta, String precioCosto, int stock) {
        List<PrecioHistorial> precios = new ArrayList<>();
        Producto producto = new Producto(
                id,
                sku,
                nombre,
                Producto.generarSlug(nombre),
                "Descripción",
                Map.of("marca", "JEPLabs"),
                stock,
                EstadoProducto.DISPONIBLE,
                1,
                LocalDateTime.now(),
                LocalDateTime.now(),
                List.of(categoriaElectronica),
                precios,
                new ArrayList<>()
        );
        precios.add(new PrecioHistorial(
                id * 10, producto, new BigDecimal(precioVenta), new BigDecimal(precioCosto),
                "GTQ", LocalDateTime.now(), null
        ));
        return producto;
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
