package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.producto.Producto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "orden_items")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class OrdenItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private Orden orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    // Copia de datos del producto al momento de la orden
    private String sku;
    private String nombreProducto;

    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 10, scale = 2)
    private BigDecimal precioUnitario;  // precio con IVA incluido

    @Column(name = "precio_base", precision = 10, scale = 2)
    private BigDecimal precioBase;      // precio sin IVA

    @Column(name = "iva_unitario", precision = 10, scale = 2)
    private BigDecimal ivaUnitario;     // IVA extraído por unidad

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;        // precioUnitario × cantidad

    public OrdenItem(Orden orden, Producto producto,
                     Integer cantidad, BigDecimal precioUnitario,
                     BigDecimal precioBase, BigDecimal ivaUnitario) {
        this.orden          = orden;
        this.producto       = producto;
        this.sku            = producto.getSku();
        this.nombreProducto = producto.getNombre();
        this.cantidad       = cantidad;
        this.precioUnitario = precioUnitario;
        this.precioBase     = precioBase;
        this.ivaUnitario    = ivaUnitario;
        this.subtotal       = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }
}
