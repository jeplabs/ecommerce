package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.producto.Producto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Tests de CarritoItem - Cálculos de subtotales")
class CarritoItemTest {

    private CarritoItem item;

    // Se ejecuta antes de cada test, prepara un item base
    @BeforeEach
    void setUp() {
        item = new CarritoItem(null, null, 2, new BigDecimal("2499.99"));
    }

    @Test
    @DisplayName("Subtotal se calcula correctamente con cantidad y precio")
    void calcularSubtotal_conCantidadYPrecio_debeRetornarSubtotalCorrecto() {
        // dado un item con cantidad=2 y precio=2499.99
        BigDecimal subtotalEsperado = new BigDecimal("4999.98");

        // cuando calculamos el subtotal
        BigDecimal subtotalObtenido = item.calcularSubtotal();

        // entonces debe ser exactamente 4999.98
        assertThat(subtotalObtenido)
                .isEqualByComparingTo(subtotalEsperado);
    }

    @Test
    @DisplayName("Subtotal con precio decimal no pierde precisión")
    void calcularSubtotal_conPrecioDecimal_noPierdePrecision() {
        // dado un item con precio que podría tener error de redondeo
        CarritoItem itemConPrecioDecimal = new CarritoItem(
                null, null, 3, new BigDecimal("2499.99")
        );
        BigDecimal subtotalEsperado = new BigDecimal("7499.97");

        BigDecimal subtotalObtenido = itemConPrecioDecimal.calcularSubtotal();

        // entonces no debe haber error de redondeo
        assertThat(subtotalObtenido)
                .isEqualByComparingTo(subtotalEsperado);
    }

    @Test
    @DisplayName("Subtotal con cantidad 1 es igual al precio unitario")
    void calcularSubtotal_conCantidadUno_debeSerIgualAlPrecioUnitario() {
        CarritoItem itemCantidadUno = new CarritoItem(
                null, null, 1, new BigDecimal("999.99")
        );

        assertThat(itemCantidadUno.calcularSubtotal())
                .isEqualByComparingTo(new BigDecimal("999.99"));
    }

    @Test
    @DisplayName("Actualizar cantidad cambia el subtotal correctamente")
    void actualizarCantidad_debeRecalcularSubtotal() {
        // dado un item con cantidad inicial de 2
        assertThat(item.calcularSubtotal())
                .isEqualByComparingTo(new BigDecimal("4999.98"));

        // cuando actualizamos la cantidad a 3
        item.actualizarCantidad(3);

        // entonces el subtotal debe ser 3 × 2499.99
        assertThat(item.calcularSubtotal())
                .isEqualByComparingTo(new BigDecimal("7499.97"));
    }
}