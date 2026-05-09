package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.producto.Producto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@DisplayName("Tests de Carrito - Cálculo de totales")
class CarritoTotalTest {

    // Mock de producto reutilizable en todos los tests
    private Producto productoMock() {
        Producto producto = mock(Producto.class);
        when(producto.getId()).thenReturn(1L);
        when(producto.getNombre()).thenReturn("Producto Test");
        when(producto.getSku()).thenReturn("SKU-TEST");
        return producto;
    }

    @Test
    @DisplayName("Total de carrito vacío es cero")
    void total_carritoVacio_debeSerCero() {
        // dado un carrito sin items
        Carrito carrito = new Carrito(null);

        // cuando calculamos el total desde el DTO
        DatosRespuestaCarrito respuesta = new DatosRespuestaCarrito(carrito);

        // entonces el total debe ser cero
        assertThat(respuesta.total())
                .isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Total de carrito vacío tiene cero items")
    void totalItems_carritoVacio_debeSerCero() {
        Carrito carrito = new Carrito(null);

        DatosRespuestaCarrito respuesta = new DatosRespuestaCarrito(carrito);

        assertThat(respuesta.totalItems()).isZero();
    }

    @Test
    @DisplayName("Total se calcula correctamente con múltiples items")
    void total_conMultiplesItems_debeSumarCorrectamente() {
        // dado un carrito con dos items distintos
        Carrito carrito = new Carrito(null);

        // usar productoMock()
        CarritoItem item1 = new CarritoItem(carrito, productoMock(), 2, new BigDecimal("2499.99"));
        CarritoItem item2 = new CarritoItem(carrito, productoMock(), 1, new BigDecimal("999.99"));

        carrito.getItems().addAll(List.of(item1, item2));

        // cuando calculamos el total
        DatosRespuestaCarrito respuesta = new DatosRespuestaCarrito(carrito);

        // entonces debe ser 4999.98 + 999.99 = 5999.97
        assertThat(respuesta.total())
                .isEqualByComparingTo(new BigDecimal("5999.97"));
    }

    @Test
    @DisplayName("Total items cuenta la suma de cantidades de todos los items")
    void totalItems_conMultiplesItems_debeSumarCantidades() {
        Carrito carrito = new Carrito(null);

        CarritoItem item1 = new CarritoItem(carrito, productoMock(), 2, new BigDecimal("2499.99"));
        CarritoItem item2 = new CarritoItem(carrito, productoMock(), 3, new BigDecimal("999.99"));

        carrito.getItems().addAll(List.of(item1, item2));

        DatosRespuestaCarrito respuesta = new DatosRespuestaCarrito(carrito);

        // 2 + 3 = 5 items en total
        assertThat(respuesta.totalItems()).isEqualTo(5);
    }

    @Test
    @DisplayName("Precisión de BigDecimal se mantiene con múltiples items")
    void total_conPreciosDecimales_mantienePrecision() {
        Carrito carrito = new Carrito(null);

        // tres items con precios que podrían causar errores de redondeo con double
        CarritoItem item1 = new CarritoItem(carrito, productoMock(), 3, new BigDecimal("33.33"));
        CarritoItem item2 = new CarritoItem(carrito, productoMock(), 3, new BigDecimal("33.33"));
        CarritoItem item3 = new CarritoItem(carrito, productoMock(), 3, new BigDecimal("33.34"));

        carrito.getItems().addAll(List.of(item1, item2, item3));

        DatosRespuestaCarrito respuesta = new DatosRespuestaCarrito(carrito);

        // 99.99 + 99.99 + 100.02 = 300.00
        assertThat(respuesta.total())
                .isEqualByComparingTo(new BigDecimal("300.00"));
    }
}