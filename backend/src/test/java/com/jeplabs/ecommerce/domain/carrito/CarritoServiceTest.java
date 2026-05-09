package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.producto.EstadoProducto;
import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.producto.ProductoRepository;
import com.jeplabs.ecommerce.domain.producto.PrecioHistorialRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
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
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

// Habilita Mockito en los tests
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("Tests de CarritoService")
class CarritoServiceTest {

    // Mocks - simulan los repositorios sin tocar la base de datos
    @Mock private CarritoRepository carritoRepositorio;
    @Mock private CarritoItemRepository itemRepositorio;
    @Mock private ProductoRepository productoRepositorio;
    @Mock private PrecioHistorialRepository precioRepositorio;
    @Mock private UsuarioRepository usuarioRepositorio;

    // El servicio real con los mocks inyectados
    @InjectMocks
    private CarritoService carritoService;

    // Datos de prueba reutilizables
    private Usuario usuarioPrincipal;
    private Usuario otroUsuario;
    private Carrito carritoPrincipal;
    private Carrito carritoOtroUsuario;
    private Producto producto;
    private CarritoItem item;

    @BeforeEach
    void setUp() {
        // Inyectar el valor de expiracionMinutos que normalmente viene de @Value
        ReflectionTestUtils.setField(carritoService, "expiracionMinutos", 72L);

        // Preparar usuarios de prueba
        usuarioPrincipal = mock(Usuario.class);
        when(usuarioPrincipal.getId()).thenReturn(1L);
        when(usuarioPrincipal.getEmail()).thenReturn("usuario@test.com");

        otroUsuario = mock(Usuario.class);
        when(otroUsuario.getId()).thenReturn(2L);
        when(otroUsuario.getEmail()).thenReturn("otro@test.com");

        // Preparar carritos de prueba
        carritoPrincipal = new Carrito(usuarioPrincipal);
        carritoOtroUsuario = new Carrito(otroUsuario);

        // Preparar producto de prueba
        producto = mock(Producto.class);
        when(producto.getId()).thenReturn(1L);
        when(producto.getStock()).thenReturn(10);
        when(producto.getEstado()).thenReturn(EstadoProducto.DISPONIBLE);

        // Preparar item de prueba perteneciente al carrito principal
        item = new CarritoItem(carritoPrincipal, producto, 2, new BigDecimal("999.99"));
    }

    // Agrupa tests relacionados con @Nested para mejor organización
    @Nested
    @DisplayName("Eliminar items del carrito")
    class EliminarItemTests {

        @Test
        @DisplayName("Eliminar item existente del carrito propio funciona correctamente")
        void eliminarItem_itemExistente_debeEliminarCorrectamente() {
            // dado que el usuario tiene un carrito activo con un item
            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(1L, carritoPrincipal.getId()))
                    .thenReturn(Optional.of(item));

            carritoPrincipal.getItems().add(item);

            // cuando elimina el item
            DatosRespuestaCarrito respuesta = carritoService.eliminarItem("usuario@test.com", 1L);

            // entonces el item se elimina y el carrito queda vacío
            verify(itemRepositorio).delete(item);
            assertThat(respuesta.items()).isEmpty();
            assertThat(respuesta.total()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Eliminar item inexistente lanza excepción")
        void eliminarItem_itemInexistente_debeLanzarExcepcion() {
            // dado que el item no existe en el carrito
            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(99L, carritoPrincipal.getId()))
                    .thenReturn(Optional.empty());

            // cuando intenta eliminar un item que no existe
            // entonces debe lanzar excepción con mensaje claro
            assertThatThrownBy(() ->
                    carritoService.eliminarItem("usuario@test.com", 99L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Item no encontrado en el carrito");
        }

        @Test
        @DisplayName("Eliminar item de otro usuario no es posible")
        void eliminarItem_itemDeOtroUsuario_debeLanzarExcepcion() {
            // dado que el item pertenece al carrito de otro usuario
            CarritoItem itemDeOtroUsuario = new CarritoItem(
                    carritoOtroUsuario, producto, 1, new BigDecimal("999.99")
            );

            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));

            // el item no se encuentra en el carrito del usuario principal
            when(itemRepositorio.findByIdAndCarritoId(
                    itemDeOtroUsuario.getId(), carritoPrincipal.getId()))
                    .thenReturn(Optional.empty());

            // cuando intenta eliminar el item de otro usuario
            // entonces debe lanzar excepción, no puede acceder a items ajenos
            assertThatThrownBy(() ->
                    carritoService.eliminarItem("usuario@test.com", itemDeOtroUsuario.getId()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Item no encontrado en el carrito");
        }
    }

    @Nested
    @DisplayName("Modificar cantidades")
    class ModificarCantidadTests {

        @Test
        @DisplayName("Actualizar cantidad válida funciona correctamente")
        void actualizarCantidad_cantidadValida_debeActualizarCorrectamente() {
            // dado que el usuario tiene un carrito con un item con cantidad 2
            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(1L, carritoPrincipal.getId()))
                    .thenReturn(Optional.of(item));

            carritoPrincipal.getItems().add(item);

            // cuando actualiza la cantidad a 5
            DatosRespuestaCarrito respuesta = carritoService.actualizarCantidad(
                    "usuario@test.com", 1L, new DatosActualizarCantidad(5)
            );

            // entonces la cantidad se actualiza y el subtotal cambia
            assertThat(respuesta.items().get(0).cantidad()).isEqualTo(5);
            assertThat(respuesta.items().get(0).subtotal())
                    .isEqualByComparingTo(new BigDecimal("4999.95"));
        }

        @Test
        @DisplayName("Cantidad mayor al stock lanza excepción")
        void actualizarCantidad_mayorAlStock_debeLanzarExcepcion() {
            // dado que el producto tiene stock de 10
            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(1L, carritoPrincipal.getId()))
                    .thenReturn(Optional.of(item));

            // cuando intenta poner cantidad 15 con stock de 10
            assertThatThrownBy(() ->
                    carritoService.actualizarCantidad(
                            "usuario@test.com", 1L, new DatosActualizarCantidad(15)
                    ))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Stock insuficiente. Stock disponible: 10");
        }

        @Test
        @DisplayName("Modificar cantidad de item ajeno no es posible")
        void actualizarCantidad_itemAjeno_debeLanzarExcepcion() {
            // dado que el item no pertenece al carrito del usuario
            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(99L, carritoPrincipal.getId()))
                    .thenReturn(Optional.empty());

            // cuando intenta modificar un item que no es suyo
            assertThatThrownBy(() ->
                    carritoService.actualizarCantidad(
                            "usuario@test.com", 99L, new DatosActualizarCantidad(2)
                    ))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Item no encontrado en el carrito");
        }
    }

    @Nested
    @DisplayName("Validaciones de cantidad cero")
    class CantidadCeroTests {

        @Test
        @DisplayName("Cantidad 0 en DTO es inválida por validación de bean")
        void datosActualizarCantidad_conCeroCantidad_debeSerInvalido() {
            // dado un DTO con cantidad 0
            DatosActualizarCantidad datos = new DatosActualizarCantidad(0);

            // cuando validamos manualmente con Jakarta Validation
            var factory = jakarta.validation.Validation.buildDefaultValidatorFactory();
            var validator = factory.getValidator();
            var violaciones = validator.validate(datos);

            // entonces debe haber exactamente una violación
            assertThat(violaciones).hasSize(1);
            assertThat(violaciones.iterator().next().getMessage())
                    .isEqualTo("La cantidad debe ser al menos 1");
        }

        @Test
        @DisplayName("Stock de producto en cero impide actualizar cantidad")
        void actualizarCantidad_conStockEnCero_debeLanzarExcepcion() {
            // dado un producto con stock en 0
            when(producto.getStock()).thenReturn(0);

            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(1L, carritoPrincipal.getId()))
                    .thenReturn(Optional.of(item));

            // cuando intenta actualizar la cantidad con stock en 0
            assertThatThrownBy(() ->
                    carritoService.actualizarCantidad(
                            "usuario@test.com", 1L, new DatosActualizarCantidad(1)
                    ))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Stock insuficiente. Stock disponible: 0");
        }

        @Test
        @DisplayName("Stock llega a 0 después de estar en el carrito")
        void actualizarCantidad_stockAgotadoMientrasEnCarrito_debeLanzarExcepcion() {
            // dado un producto que tenía stock cuando se agregó al carrito
            // pero ahora su stock bajó a 0 (otro usuario compró el último)
            when(producto.getStock()).thenReturn(0);

            when(usuarioRepositorio.findByEmail("usuario@test.com"))
                    .thenReturn(Optional.of(usuarioPrincipal));
            when(carritoRepositorio.findByUsuarioIdAndEstado(1L, EstadoCarrito.ACTIVO))
                    .thenReturn(Optional.of(carritoPrincipal));
            when(itemRepositorio.findByIdAndCarritoId(1L, carritoPrincipal.getId()))
                    .thenReturn(Optional.of(item));

            // cuando intenta mantener la cantidad actual con stock agotado
            assertThatThrownBy(() ->
                    carritoService.actualizarCantidad(
                            "usuario@test.com", 1L, new DatosActualizarCantidad(2)
                    ))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("Stock insuficiente. Stock disponible: 0");
        }
    }
}