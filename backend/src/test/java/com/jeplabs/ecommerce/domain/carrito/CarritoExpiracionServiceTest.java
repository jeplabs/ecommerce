package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.producto.EstadoProducto;
import com.jeplabs.ecommerce.domain.producto.PrecioHistorial;
import com.jeplabs.ecommerce.domain.producto.PrecioHistorialRepository;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.infra.exceptions.CarritoExpiradoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Tests de Expiración y Sincronización del Carrito")
class CarritoExpiracionServiceTest {

    @Mock private CarritoRepository carritoRepositorio;
    @Mock private CarritoItemRepository itemRepositorio;
    @Mock private ProductoRepository productoRepositorio;
    @Mock private PrecioHistorialRepository precioRepositorio;
    @Mock private UsuarioRepository usuarioRepositorio;

    @InjectMocks
    private CarritoService carritoService;

    private Usuario usuario;
    private Carrito carritoVigente;
    private Carrito carritoExpirado;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(carritoService, "expiracionMinutos", 60L);
        ReflectionTestUtils.setField(carritoService, "notificacionMinutosAntes", 10L);

        usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(1L);
        when(usuario.getEmail()).thenReturn("test@ecommerce.com");
        when(usuarioRepositorio.findByEmail("test@ecommerce.com")).thenReturn(Optional.of(usuario));

        carritoVigente = new Carrito(usuario);
        carritoVigente.renovarExpiracion(60L);

        carritoExpirado = new Carrito(usuario);
        // Expirado hace 5 minutos
        ReflectionTestUtils.setField(carritoExpirado, "expiraAt", LocalDateTime.now().minusMinutes(5));
    }

    @Nested
    @DisplayName("Lazy Expiration en verOCrearCarrito")
    class LazyExpirationTests {

        @Test
        @DisplayName("Carrito vigente retorna sin marcar expirado y con carritoAnteriorExpirado=false")
        void verCarrito_CuandoEstaVigente_RetornaNormal() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoVigente));

            DatosRespuestaCarrito res = carritoService.verOCrearCarrito("test@ecommerce.com");

            assertThat(res.expiracion()).isNotNull();
            assertThat(res.expiracion().carritoAnteriorExpirado()).isFalse();
            assertThat(res.expiracion().segundosRestantes()).isGreaterThan(0);
            assertThat(res.estado()).isEqualTo(EstadoCarrito.ACTIVO);
            verify(carritoRepositorio, never()).save(carritoVigente);
        }

        @Test
        @DisplayName("Carrito expirado es marcado como EXPIRADO y genera nuevo carrito activo con señal carritoAnteriorExpirado=true")
        void verCarrito_CuandoExpiro_GeneraNuevoYMarcaViejoExpirado() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoExpirado));

            when(carritoRepositorio.save(any(Carrito.class))).thenAnswer(invocation -> {
                Carrito c = invocation.getArgument(0);
                ReflectionTestUtils.setField(c, "id", c.getEstado() == EstadoCarrito.EXPIRADO ? 10L : 11L);
                return c;
            });

            DatosRespuestaCarrito res = carritoService.verOCrearCarrito("test@ecommerce.com");

            assertThat(carritoExpirado.getEstado()).isEqualTo(EstadoCarrito.EXPIRADO);
            assertThat(res.expiracion().carritoAnteriorExpirado()).isTrue();
            assertThat(res.expiracion().segundosRestantes()).isGreaterThan(0);
            assertThat(res.estado()).isEqualTo(EstadoCarrito.ACTIVO);
        }
    }

    @Nested
    @DisplayName("Sliding Expiration en mutaciones de items")
    class SlidingExpirationTests {

        @Test
        @DisplayName("Actualizar cantidad sobre carrito expirado lanza CarritoExpiradoException (410)")
        void actualizarCantidad_CuandoCarritoExpiro_LanzaCarritoExpiradoException() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoExpirado));

            assertThatThrownBy(() -> carritoService.actualizarCantidad("test@ecommerce.com", 1L, new DatosActualizarCantidad(3)))
                    .isInstanceOf(CarritoExpiradoException.class);
        }

        @Test
        @DisplayName("Actualizar cantidad sobre carrito vigente renueva su tiempo de expiración (Sliding Expiration)")
        void actualizarCantidad_CuandoVigente_RenuevaExpiracion() {
            LocalDateTime expiraOriginal = carritoVigente.getExpiraAt();

            Producto prod = mock(Producto.class);
            when(prod.getStock()).thenReturn(10);
            CarritoItem item = new CarritoItem(carritoVigente, prod, 1, new BigDecimal("100.00"));
            ReflectionTestUtils.setField(item, "id", 5L);
            carritoVigente.getItems().add(item);

            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoVigente));
            when(itemRepositorio.findByIdAndCarritoId(5L, carritoVigente.getId()))
                    .thenReturn(Optional.of(item));

            DatosRespuestaCarrito res = carritoService.actualizarCantidad("test@ecommerce.com", 5L, new DatosActualizarCantidad(2));

            assertThat(res.items()).hasSize(1);
            assertThat(carritoVigente.getExpiraAt()).isAfterOrEqualTo(expiraOriginal);
        }
    }

    @Nested
    @DisplayName("Renovación explícita de carrito")
    class RenovarCarritoTests {

        @Test
        @DisplayName("Renovar carrito vigente extiende su expiraAt y retorna segundos restantes actualizados")
        void renovar_CuandoVigente_ExtiendeTiempo() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoVigente));

            DatosRespuestaCarrito res = carritoService.renovar("test@ecommerce.com");

            assertThat(res.expiracion().segundosRestantes()).isGreaterThan(0);
            assertThat(res.expiracion().carritoAnteriorExpirado()).isFalse();
        }

        @Test
        @DisplayName("Renovar carrito expirado lanza CarritoExpiradoException")
        void renovar_CuandoExpirado_LanzaExcepcion() {
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoExpirado));

            assertThatThrownBy(() -> carritoService.renovar("test@ecommerce.com"))
                    .isInstanceOf(CarritoExpiradoException.class);
        }
    }

    @Nested
    @DisplayName("Restauración de carrito expirado")
    class RestaurarCarritoTests {

        @Test
        @DisplayName("Restaura productos del último carrito expirado validando stock y precio vigente")
        void restaurar_CuandoHayCarritoExpirado_RestauraItemsCorrectamente() {
            Producto prodDisponible = mock(Producto.class);
            when(prodDisponible.getId()).thenReturn(100L);
            when(prodDisponible.getNombre()).thenReturn("Tenis Deportivos");
            when(prodDisponible.getEstado()).thenReturn(EstadoProducto.DISPONIBLE);
            when(prodDisponible.getStock()).thenReturn(5);

            PrecioHistorial precioHistorial = mock(PrecioHistorial.class);
            when(precioHistorial.getPrecioVenta()).thenReturn(new BigDecimal("175.00"));
            when(precioRepositorio.findByProductoIdAndFechaFinIsNull(100L))
                    .thenReturn(Optional.of(precioHistorial));

            when(productoRepositorio.findById(100L)).thenReturn(Optional.of(prodDisponible));

            CarritoItem itemExpirado = new CarritoItem(carritoExpirado, prodDisponible, 2, new BigDecimal("150.00"));
            carritoExpirado.getItems().add(itemExpirado);
            carritoExpirado.marcarComoExpirado();

            when(carritoRepositorio.findFirstByUsuarioIdAndEstadoOrderByActualizadoAtDesc(1L, EstadoCarrito.EXPIRADO))
                    .thenReturn(Optional.of(carritoExpirado));

            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoVigente));

            when(itemRepositorio.findByCarritoIdAndProductoId(any(), eq(100L)))
                    .thenReturn(Optional.empty());

            DatosRespuestaRestauracion resultado = carritoService.restaurar("test@ecommerce.com");

            assertThat(resultado.itemsNoRestaurados()).isEmpty();
            assertThat(resultado.carrito().items()).hasSize(1);
            assertThat(carritoExpirado.getEstado()).isEqualTo(EstadoCarrito.ABANDONADO); // No restaurable dos veces
        }

        @Test
        @DisplayName("Si el producto expirado ya no tiene stock, se agrega a itemsNoRestaurados con motivo SIN_STOCK")
        void restaurar_CuandoProductoSinStock_NotificaEnItemsNoRestaurados() {
            Producto prodAgotado = mock(Producto.class);
            when(prodAgotado.getId()).thenReturn(200L);
            when(prodAgotado.getNombre()).thenReturn("Gorra de Colección");
            when(prodAgotado.getEstado()).thenReturn(EstadoProducto.DISPONIBLE);
            when(prodAgotado.getStock()).thenReturn(0);

            when(productoRepositorio.findById(200L)).thenReturn(Optional.of(prodAgotado));

            CarritoItem itemExpirado = new CarritoItem(carritoExpirado, prodAgotado, 1, new BigDecimal("80.00"));
            carritoExpirado.getItems().add(itemExpirado);
            carritoExpirado.marcarComoExpirado();

            when(carritoRepositorio.findFirstByUsuarioIdAndEstadoOrderByActualizadoAtDesc(1L, EstadoCarrito.EXPIRADO))
                    .thenReturn(Optional.of(carritoExpirado));

            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoVigente));

            DatosRespuestaRestauracion resultado = carritoService.restaurar("test@ecommerce.com");

            assertThat(resultado.itemsNoRestaurados()).hasSize(1);
            assertThat(resultado.itemsNoRestaurados().get(0).motivo()).isEqualTo("SIN_STOCK");
            assertThat(resultado.itemsNoRestaurados().get(0).nombre()).isEqualTo("Gorra de Colección");
        }
    }
}
