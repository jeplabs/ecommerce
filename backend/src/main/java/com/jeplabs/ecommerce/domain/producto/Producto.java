package com.jeplabs.ecommerce.domain.producto;

import com.jeplabs.ecommerce.domain.categoria.Categoria;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Representa tabla productos
// Usa @CreatedDate y @LastModifiedDate para timestamps automáticos
// specs se mapea como JSONB de PostgreSQL usando un Map
@Entity
@Table(name = "productos")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@EntityListeners(AuditingEntityListener.class)
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku;
    private String nombre;
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> specs;

    private Integer stock;
    private boolean active;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "producto_categorias",
            joinColumns = @JoinColumn(name = "producto_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id")
    )
    private List<Categoria> categorias = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrecioHistorial> precios = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductoImagen> imagenes = new ArrayList<>();

    public Producto(DatosCrearProducto datos, List<Categoria> categorias) {
        this.sku = datos.sku();
        this.nombre = datos.nombre();
        this.slug = generarSlug(datos.nombre());
        this.descripcion = datos.descripcion();
        this.specs = datos.specs();
        this.stock = datos.stock();
        this.active = true;
        this.categorias = categorias;
    }

    public void actualizar(DatosActualizarProducto datos) {
        if (datos.nombre() != null) {
            this.nombre = datos.nombre();
            this.slug = generarSlug(datos.nombre());
        }
        if (datos.descripcion() != null) this.descripcion = datos.descripcion();
        if (datos.specs() != null) this.specs = datos.specs();
        if (datos.stock() != null) this.stock = datos.stock();
    }

    public void desactivar() {
        this.active = false;
    }

    public static String generarSlug(String nombre) {
        return nombre.toLowerCase()
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("[\\s]+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}