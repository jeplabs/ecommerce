package com.jeplabs.ecommerce.domain.producto;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Representa tabla precio_historial
// Guarda precio de venta y costo por separado.
// fechaFin = null indica que es el precio actual activo.
// El margen se calcula al vuelo en el DTO de respuesta para admin.
@Entity
@Table(name = "precio_historial")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class PrecioHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(name = "precio_venta", precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "precio_costo", precision = 10, scale = 2)
    private BigDecimal precioCosto;

    private String moneda;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    public PrecioHistorial(Producto producto, DatosPrecio datos) {
        this.producto = producto;
        this.precioVenta = datos.precioVenta();
        this.precioCosto = datos.precioCosto();
        this.moneda = datos.moneda();
        this.fechaInicio = LocalDateTime.now();
        this.fechaFin = null; // null = precio actual activo
    }

    public void cerrar() {
        this.fechaFin = LocalDateTime.now();
    }

    // Calcula el margen de ganancia como porcentaje
    public BigDecimal calcularMargen() {
        if (precioCosto.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return precioVenta.subtract(precioCosto)
                .divide(precioVenta, 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }
}