package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.carrito.*;
import com.jeplabs.ecommerce.domain.direccion.Direccion;
import com.jeplabs.ecommerce.domain.direccion.DireccionRepository;
import com.jeplabs.ecommerce.domain.envio.EnvioCalculator;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvio;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvioRepository;
import com.jeplabs.ecommerce.domain.producto.EstadoProducto;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.sucursal.Sucursal;
import com.jeplabs.ecommerce.domain.sucursal.SucursalRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.infra.email.EmailService;
import com.jeplabs.ecommerce.infra.exceptions.*;
import com.jeplabs.ecommerce.domain.banco.CuentaBancariaRepository;
import com.jeplabs.ecommerce.domain.pago.MetodoPago;
import com.jeplabs.ecommerce.domain.pago.MetodoPagoService;
import com.jeplabs.ecommerce.domain.pago.TipoMetodoPago;
import com.jeplabs.ecommerce.infra.storage.ArchivoValidator;
import com.jeplabs.ecommerce.infra.storage.StorageService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Tests de OrdenService")
class OrdenServiceTest {

    @Mock private OrdenRepository ordenRepositorio;
    @Mock private OrdenItemRepository itemRepositorio;
    @Mock private CarritoRepository carritoRepositorio;
    @Mock private CarritoItemRepository carritoItemRepositorio;
    @Mock private ProductoRepository productoRepositorio;
    @Mock private DireccionRepository direccionRepositorio;
    @Mock private SucursalRepository sucursalRepositorio;
    @Mock private UsuarioRepository usuarioRepositorio;
    @Mock private ServicioEnvioRepository servicioEnvioRepositorio;
    @Mock private IvaCalculator ivaCalculator;
    @Mock private EnvioCalculator envioCalculator;
    @Mock private EmailService emailService;
    @Mock private MetodoPagoService metodoPagoService;
    @Mock private CuentaBancariaRepository cuentaBancariaRepositorio;
    @Mock private StorageService storageService;
    @Mock private ArchivoValidator archivoValidator;

    @InjectMocks
    private OrdenService ordenService;

    private Usuario usuario;
    private Carrito carrito;
    private CarritoItem carritoItem;
    private Producto producto;
    private Direccion direccion;
    private Sucursal sucursal;
    private ServicioEnvio servicioEnvio;
    private ServicioEnvio servicioRetiro;
    private MetodoPago metodoPago;
    private DatosCrearOrden datosCrearOrden;

    @BeforeEach
    void setUp() {
        // Usuario
        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(1L);
        when(usuario.getEmail()).thenReturn("usuario@test.com");
        when(usuario.getNombre()).thenReturn("Juan");

        // Producto
        producto = mock(Producto.class);
        when(producto.getId()).thenReturn(1L);
        when(producto.getNombre()).thenReturn("Sony A7 IV");
        when(producto.getSku()).thenReturn("CAM-SONY-A7IV");
        when(producto.getStock()).thenReturn(10);
        when(producto.getEstado()).thenReturn(EstadoProducto.DISPONIBLE);

        // Dirección
        direccion = mock(Direccion.class);
        when(direccion.getId()).thenReturn(1L);
        when(direccion.isActivo()).thenReturn(true);
        when(direccion.getAlias()).thenReturn("Casa");
        when(direccion.getDireccion()).thenReturn("5ta Avenida 10-20");
        when(direccion.getCiudad()).thenReturn("Guatemala");
        when(direccion.getPais()).thenReturn("Guatemala");
        when(direccion.getTelefono()).thenReturn("+50212345678");

        // Sucursal de retiro
        sucursal = mock(Sucursal.class);
        when(sucursal.getId()).thenReturn(2L);
        when(sucursal.isActivo()).thenReturn(true);
        when(sucursal.getNombre()).thenReturn("Tienda Zona 10");
        when(sucursal.getDireccion()).thenReturn("Boulevard Los Proceres 5-50, Zona 10");
        when(sucursal.getCiudad()).thenReturn("Ciudad de Guatemala");
        when(sucursal.getEstado()).thenReturn("Guatemala");
        when(sucursal.getCodigoPostal()).thenReturn("01010");
        when(sucursal.getPais()).thenReturn("GT");
        when(sucursal.getTelefono()).thenReturn("+502 2456-7890");
        when(sucursal.getHorario()).thenReturn("Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00");
        when(sucursal.getReferencias()).thenReturn("Plaza Comercial Zona 10");

        // Servicio de envío a domicilio
        servicioEnvio = mock(ServicioEnvio.class);
        when(servicioEnvio.getId()).thenReturn(1L);
        when(servicioEnvio.getNombre()).thenReturn("Guatex");
        when(servicioEnvio.isActivo()).thenReturn(true);
        when(servicioEnvio.esRetiroEnTienda()).thenReturn(false);
        when(servicioEnvio.calcularCostoTotal(any())).thenReturn(new BigDecimal("45.00"));

        // Servicio de retiro en tienda
        servicioRetiro = mock(ServicioEnvio.class);
        when(servicioRetiro.getId()).thenReturn(3L);
        when(servicioRetiro.getNombre()).thenReturn("Retiro en tienda");
        when(servicioRetiro.isActivo()).thenReturn(true);
        when(servicioRetiro.esRetiroEnTienda()).thenReturn(true);
        when(servicioRetiro.calcularCostoTotal(any())).thenReturn(BigDecimal.ZERO);

        // MetodoPago
        metodoPago = mock(MetodoPago.class);
        when(metodoPago.getCodigo()).thenReturn("TRANSFERENCIA");
        when(metodoPago.getNombre()).thenReturn("Transferencia Bancaria");
        when(metodoPago.getTipo()).thenReturn(TipoMetodoPago.TRANSFERENCIA);
        when(metodoPago.isActivo()).thenReturn(true);
        when(metodoPagoService.buscarPorCodigo(any())).thenReturn(metodoPago);

        // CarritoItem
        carritoItem = mock(CarritoItem.class);
        when(carritoItem.getProducto()).thenReturn(producto);
        when(carritoItem.getCantidad()).thenReturn(2);
        when(carritoItem.getPrecioUnitario()).thenReturn(new BigDecimal("2799.00"));

        // Carrito con items
        carrito = mock(Carrito.class);
        when(carrito.getId()).thenReturn(1L);
        when(carrito.getItems()).thenReturn(new ArrayList<>(List.of(carritoItem)));

        // DTO de creación
        datosCrearOrden = new DatosCrearOrden(1L, 1L, FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", null);

        // Mocks de repositorios
        when(usuarioRepositorio.findByEmail("usuario@test.com"))
                .thenReturn(Optional.of(usuario));
        when(direccionRepositorio.findByIdAndUsuarioId(1L, 1L))
                .thenReturn(Optional.of(direccion));
        when(sucursalRepositorio.findById(2L))
                .thenReturn(Optional.of(sucursal));
        when(servicioEnvioRepositorio.findById(1L))
                .thenReturn(Optional.of(servicioEnvio));
        when(servicioEnvioRepositorio.findById(3L))
                .thenReturn(Optional.of(servicioRetiro));
        when(productoRepositorio.findById(1L))
                .thenReturn(Optional.of(producto));

        // IVA calculator
        when(ivaCalculator.extraerPrecioBase(any()))
                .thenReturn(new BigDecimal("2499.11"));
        when(ivaCalculator.extraerIva(any()))
                .thenReturn(new BigDecimal("299.89"));
        when(ivaCalculator.calcularIvaTotal(any()))
                .thenReturn(new BigDecimal("599.78"));

        // Envío calculator
        when(envioCalculator.calcularCostoEnvio(any(), any(), any()))
                .thenReturn(new BigDecimal("45.00"));

        // ordenRepositorio.save devuelve la orden que recibe
        when(ordenRepositorio.save(any(Orden.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(ordenRepositorio.findById(any()))
                .thenAnswer(invocation -> {
                    Orden orden = new Orden(usuario, direccion, servicioEnvio,
                            FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA",
                            new BigDecimal("45.00"), null,
                            new BigDecimal("5598.00"), new BigDecimal("599.78"));
                    return Optional.of(orden);
                });
    }

    @Nested
    @DisplayName("Crear orden desde carrito")
    class CrearOrdenTests {

        @Test
        @DisplayName("Flujo exitoso crea orden en estado PENDIENTE")
        void crear_flujoExitoso_debeCrearOrdenEnPendiente() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));

            DatosRespuestaOrden respuesta = ordenService.crear("usuario@test.com", datosCrearOrden);

            assertThat(respuesta.estado()).isEqualTo(EstadoOrden.PENDIENTE);
            assertThat(respuesta.direccionId()).isEqualTo(1L);
            assertThat(respuesta.sucursalId()).isNull();
            verify(ordenRepositorio, atLeastOnce()).save(any(Orden.class));
        }

        @Test
        @DisplayName("Retiro en tienda con sucursal activa guarda sucursalId y snapshot de ubicación")
        void crear_retiroEnTiendaConSucursalActiva_debeGuardarSucursalYSnapshot() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));
            when(envioCalculator.calcularCostoEnvio(any(), eq(servicioRetiro), any()))
                    .thenReturn(BigDecimal.ZERO);

            DatosCrearOrden datosRetiro = new DatosCrearOrden(
                    null, 2L, 3L, FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", "Paso a recoger a las 3pm"
            );

            DatosRespuestaOrden respuesta = ordenService.crear("usuario@test.com", datosRetiro);

            assertThat(respuesta.estado()).isEqualTo(EstadoOrden.PENDIENTE);
            assertThat(respuesta.direccionId()).isNull();
            assertThat(respuesta.sucursalId()).isEqualTo(2L);
            assertThat(respuesta.servicioEnvio()).isEqualTo("Retiro en tienda");
            assertThat(respuesta.direccionEnvio().alias()).isEqualTo("Tienda Zona 10");
            assertThat(respuesta.direccionEnvio().calle()).isEqualTo("Boulevard Los Proceres 5-50, Zona 10");
            assertThat(respuesta.direccionEnvio().ciudad()).isEqualTo("Ciudad de Guatemala");
            assertThat(respuesta.direccionEnvio().pais()).isEqualTo("GT");
            assertThat(respuesta.direccionEnvio().telefono()).isEqualTo("+502 2456-7890");
            assertThat(respuesta.direccionEnvio().horario()).isEqualTo("Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00");
        }

        @Test
        @DisplayName("Retiro en tienda sin sucursalId lanza IllegalArgumentException")
        void crear_retiroEnTiendaSinSucursalId_debeLanzarExcepcion() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));

            DatosCrearOrden datosSinSucursal = new DatosCrearOrden(
                    null, null, 3L, FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", null
            );

            assertThatThrownBy(() -> ordenService.crear("usuario@test.com", datosSinSucursal))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("La sucursal de retiro es obligatoria");

            verify(ordenRepositorio, never()).save(any());
        }

        @Test
        @DisplayName("Retiro en tienda con sucursal inactiva lanza IllegalArgumentException")
        void crear_retiroEnTiendaSucursalInactiva_debeLanzarExcepcion() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));
            when(sucursal.isActivo()).thenReturn(false);

            DatosCrearOrden datosRetiro = new DatosCrearOrden(
                    null, 2L, 3L, FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", null
            );

            assertThatThrownBy(() -> ordenService.crear("usuario@test.com", datosRetiro))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("La sucursal seleccionada no está disponible");

            verify(ordenRepositorio, never()).save(any());
        }

        @Test
        @DisplayName("Envío a domicilio sin direccionId lanza IllegalArgumentException")
        void crear_envioDomicilioSinDireccionId_debeLanzarExcepcion() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));

            DatosCrearOrden datosSinDireccion = new DatosCrearOrden(
                    null, null, 1L, FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", null
            );

            assertThatThrownBy(() -> ordenService.crear("usuario@test.com", datosSinDireccion))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("La dirección de envío es obligatoria");

            verify(ordenRepositorio, never()).save(any());
        }

        @Test
        @DisplayName("Carrito vacío lanza CarritoVacioException")
        void crear_carritoVacio_debeLanzarExcepcion() {
            Carrito carritoVacio = mock(Carrito.class);
            when(carritoVacio.getItems()).thenReturn(new ArrayList<>());
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoVacio));

            assertThatThrownBy(() ->
                    ordenService.crear("usuario@test.com", datosCrearOrden))
                    .isInstanceOf(CarritoVacioException.class)
                    .hasMessage("Tu carrito está vacío");

            verify(ordenRepositorio, never()).save(any());
        }

        @Test
        @DisplayName("Carrito inexistente lanza CarritoNoEncontradoException")
        void crear_carritoInexistente_debeLanzarExcepcion() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    ordenService.crear("usuario@test.com", datosCrearOrden))
                    .isInstanceOf(CarritoNoEncontradoException.class)
                    .hasMessage("No tienes un carrito activo");

            verify(ordenRepositorio, never()).save(any());
        }

        @Test
        @DisplayName("Producto no disponible lanza ProductoNoDisponibleException")
        void crear_productoNoDisponible_debeLanzarExcepcion() {
            when(producto.getEstado()).thenReturn(EstadoProducto.DESCONTINUADO);
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));

            assertThatThrownBy(() ->
                    ordenService.crear("usuario@test.com", datosCrearOrden))
                    .isInstanceOf(ProductoNoDisponibleException.class);
        }

        @Test
        @DisplayName("Stock insuficiente lanza StockInsuficienteException")
        void crear_stockInsuficiente_debeLanzarExcepcion() {
            when(producto.getStock()).thenReturn(1); // stock menor a cantidad del carrito (2)
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));

            assertThatThrownBy(() ->
                    ordenService.crear("usuario@test.com", datosCrearOrden))
                    .isInstanceOf(StockInsuficienteException.class)
                    .hasMessageContaining("Stock disponible: 1");
        }

        @Test
        @DisplayName("Envío gratis aplicado cuando subtotal supera el mínimo")
        void crear_subtotalSuperaMinimoEnvio_debeTenerCostoEnvioCero() {
            when(envioCalculator.calcularCostoEnvio(any(), any(), any()))
                    .thenReturn(BigDecimal.ZERO); // envío gratis
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carrito));

            DatosRespuestaOrden respuesta = ordenService.crear("usuario@test.com", datosCrearOrden);

            assertThat(respuesta.costoEnvio()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("Obtener órdenes")
    class ObtenerOrdenesTests {

        @Test
        @DisplayName("Listar mis órdenes retorna órdenes del usuario")
        void listarMisOrdenes_conOrdenes_debeRetornarLista() {
            Orden orden1 = mock(Orden.class);
            Orden orden2 = mock(Orden.class);

            configurarOrdenMock(orden1, 1L);
            configurarOrdenMock(orden2, 2L);

            Page<Orden> pagina = new PageImpl<>(List.of(orden1, orden2));
            when(ordenRepositorio.findByUsuarioIdOrderByCreadoAtDesc(eq(1L), any()))
                    .thenReturn(pagina);

            Page<DatosRespuestaOrden> resultado = ordenService.listarMisOrdenes(
                    "usuario@test.com", PageRequest.of(0, 10));

            assertThat(resultado.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("Listar mis órdenes sin órdenes retorna lista vacía")
        void listarMisOrdenes_sinOrdenes_debeRetornarListaVacia() {
            when(ordenRepositorio.findByUsuarioIdOrderByCreadoAtDesc(eq(1L), any()))
                    .thenReturn(Page.empty());

            Page<DatosRespuestaOrden> resultado = ordenService.listarMisOrdenes(
                    "usuario@test.com", PageRequest.of(0, 10));

            assertThat(resultado.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Admin lista todas las órdenes sin filtro")
        void listarTodas_comoAdmin_debeRetornarTodasLasOrdenes() {
            Orden orden1 = mock(Orden.class);
            Orden orden2 = mock(Orden.class);
            Orden orden3 = mock(Orden.class);

            configurarOrdenMock(orden1, 1L);
            configurarOrdenMock(orden2, 2L);
            configurarOrdenMock(orden3, 3L);

            Page<Orden> pagina = new PageImpl<>(List.of(orden1, orden2, orden3));
            when(ordenRepositorio.buscarTodas(isNull(), any())).thenReturn(pagina);

            Page<DatosRespuestaOrden> resultado = ordenService.listarTodas(
                    null, PageRequest.of(0, 10));

            assertThat(resultado.getContent()).hasSize(3);
        }

        @Test
        @DisplayName("Admin filtra órdenes por estado")
        void listarTodas_conFiltroEstado_debeRetornarSoloEseEstado() {
            Orden ordenPendiente = mock(Orden.class);
            configurarOrdenMock(ordenPendiente, 1L);

            Page<Orden> pagina = new PageImpl<>(List.of(ordenPendiente));
            when(ordenRepositorio.buscarTodas(eq(EstadoOrden.PENDIENTE), any()))
                    .thenReturn(pagina);

            Page<DatosRespuestaOrden> resultado = ordenService.listarTodas(
                    EstadoOrden.PENDIENTE, PageRequest.of(0, 10));

            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).estado())
                    .isEqualTo(EstadoOrden.PENDIENTE);
        }

        @Test
        @DisplayName("Buscar orden inexistente lanza OrdenNoEncontradaException")
        void buscarMiOrden_ordenInexistente_debeLanzarExcepcion() {
            when(ordenRepositorio.findByIdAndUsuarioId(99L, 1L))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    ordenService.buscarMiOrden("usuario@test.com", 99L))
                    .isInstanceOf(OrdenNoEncontradaException.class)
                    .hasMessage("Orden no encontrada con ID: 99");
        }
    }

    @Nested
    @DisplayName("Cambiar estado de orden")
    class CambiarEstadoTests {

        @Test
        @DisplayName("Cambio de estado válido PENDIENTE a CONFIRMADA")
        void cambiarEstado_transicionValida_debeActualizarEstado() {
            Orden orden = new Orden(usuario, direccion, servicioEnvio,
                    FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", new BigDecimal("45.00"),
                    null, new BigDecimal("2799.00"), new BigDecimal("299.89"));

            when(ordenRepositorio.findById(1L)).thenReturn(Optional.of(orden));

            DatosRespuestaOrden respuesta = ordenService.cambiarEstado(
                    1L, new DatosActualizarEstadoOrden(EstadoOrden.CONFIRMADA));

            assertThat(respuesta.estado()).isEqualTo(EstadoOrden.CONFIRMADA);
        }

        @Test
        @DisplayName("Transición inválida PENDIENTE a ENTREGADA lanza EstadoInvalidoException")
        void cambiarEstado_transicionInvalida_debeLanzarExcepcion() {
            Orden orden = new Orden(usuario, direccion, servicioEnvio,
                    FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", new BigDecimal("45.00"),
                    null, new BigDecimal("2799.00"), new BigDecimal("299.89"));

            when(ordenRepositorio.findById(1L)).thenReturn(Optional.of(orden));

            assertThatThrownBy(() ->
                    ordenService.cambiarEstado(
                            1L, new DatosActualizarEstadoOrden(EstadoOrden.ENTREGADA)))
                    .isInstanceOf(EstadoInvalidoException.class);
        }

        @Test
        @DisplayName("Orden inexistente lanza OrdenNoEncontradaException")
        void cambiarEstado_ordenInexistente_debeLanzarExcepcion() {
            when(ordenRepositorio.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    ordenService.cambiarEstado(
                            99L, new DatosActualizarEstadoOrden(EstadoOrden.CONFIRMADA)))
                    .isInstanceOf(OrdenNoEncontradaException.class);

            verify(ordenRepositorio, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Cancelar orden")
    class CancelarOrdenTests {

        @Test
        @DisplayName("Cancelar orden en PENDIENTE devuelve stock y cambia estado")
        void cancelar_ordenPendiente_debeDevolverStockYCambiarEstado() {
            Orden orden = new Orden(usuario, direccion, servicioEnvio,
                    FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", new BigDecimal("45.00"),
                    null, new BigDecimal("2799.00"), new BigDecimal("299.89"));

            OrdenItem ordenItem = new OrdenItem(orden, producto, 2,
                    new BigDecimal("2799.00"), new BigDecimal("2499.11"),
                    new BigDecimal("299.89"));
            orden.getItems().add(ordenItem);

            when(ordenRepositorio.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(orden));
            when(productoRepositorio.findById(1L))
                    .thenReturn(Optional.of(producto));

            DatosRespuestaOrden respuesta = ordenService.cancelarMiOrden(
                    "usuario@test.com", 1L);

            assertThat(respuesta.estado()).isEqualTo(EstadoOrden.CANCELADA);
            verify(producto).devolverStock(2); // ← verifica devolución de stock
        }

        @Test
        @DisplayName("Cancelar orden ENVIADA lanza EstadoInvalidoException")
        void cancelar_ordenEnviada_debeLanzarExcepcion() {
            Orden orden = new Orden(usuario, direccion, servicioEnvio,
                    FormaPagoEnvio.EN_LINEA, "TRANSFERENCIA", new BigDecimal("45.00"),
                    null, new BigDecimal("2799.00"), new BigDecimal("299.89"));

            // Avanzar estado hasta ENVIADA
            orden.cambiarEstado(EstadoOrden.CONFIRMADA);
            orden.cambiarEstado(EstadoOrden.EN_PROCESO);
            orden.cambiarEstado(EstadoOrden.ENVIADA);

            when(ordenRepositorio.findByIdAndUsuarioId(1L, 1L))
                    .thenReturn(Optional.of(orden));

            assertThatThrownBy(() ->
                    ordenService.cancelarMiOrden("usuario@test.com", 1L))
                    .isInstanceOf(EstadoInvalidoException.class);
        }
    }

    // Método auxiliar para configurar mocks de Orden
    private void configurarOrdenMock(Orden orden, Long id) {
        when(orden.getId()).thenReturn(id);
        when(orden.getEstado()).thenReturn(EstadoOrden.PENDIENTE);
        when(orden.getDireccion()).thenReturn(direccion);
        when(orden.getServicioEnvio()).thenReturn(servicioEnvio);
        when(orden.getFormaPagoEnvio()).thenReturn(FormaPagoEnvio.EN_LINEA);
        when(orden.getItems()).thenReturn(new ArrayList<>());
        when(orden.getSubtotal()).thenReturn(new BigDecimal("2799.00"));
        when(orden.getIva()).thenReturn(new BigDecimal("299.89"));
        when(orden.getCostoEnvio()).thenReturn(new BigDecimal("45.00"));
        when(orden.getTotal()).thenReturn(new BigDecimal("2844.00"));
        when(orden.getCreadoAt()).thenReturn(java.time.LocalDateTime.now());
        when(orden.getActualizadoAt()).thenReturn(java.time.LocalDateTime.now());
    }
}
