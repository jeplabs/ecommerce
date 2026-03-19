package com.jeplabs.ecommerce.domain.producto;

import jakarta.persistence.*;
import lombok.*;

// Representa la tabla producto_imagenes
// Solo una imagen puede ser principal = true por producto, esto se controla en el servicio
@Entity
@Table(name = "producto_imagenes")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ProductoImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    private String url;
    private boolean principal;

    public ProductoImagen(Producto producto, String url, boolean principal) {
        this.producto = producto;
        this.url = url;
        this.principal = principal;
    }

    // Método para marcar una imagen como principal, que el servicio llamará después de resetear las demás.
    public void marcarComoPrincipal() {
        this.principal = true;
    }
}