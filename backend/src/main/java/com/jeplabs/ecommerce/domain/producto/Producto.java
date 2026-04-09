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

    @Enumerated(EnumType.STRING)
    private EstadoProducto estado;

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
    @OrderBy("principal DESC")
    private List<ProductoImagen> imagenes = new ArrayList<>();

    public Producto(DatosCrearProducto datos, List<Categoria> categorias) {
        this.sku = datos.sku();
        this.nombre = datos.nombre();
        this.slug = generarSlug(datos.nombre());
        this.descripcion = datos.descripcion();
        this.specs = datos.specs();
        this.stock = datos.stock();
        this.estado = datos.stock() > 0 ? EstadoProducto.DISPONIBLE : EstadoProducto.SIN_STOCK; // ← automático
        this.categorias = categorias;
    }

    public void actualizar(DatosActualizarProducto datos) {
        if (datos.nombre() != null) {
            this.nombre = datos.nombre();
            this.slug = generarSlug(datos.nombre());
        }
        if (datos.descripcion() != null) this.descripcion = datos.descripcion();
        if (datos.specs() != null) this.specs = datos.specs();
        if (datos.stock() != null) {
            this.stock = datos.stock();
            actualizarEstadoPorStock(); // ← automático al actualizar stock
        }
    }

    // Cambia entre DISPONIBLE y SIN_STOCK automáticamente según el stock
    // Solo actúa si el estado actual es uno de los dos, respeta OCULTO y DESCONTINUADO
    private void actualizarEstadoPorStock() {
        if (this.estado == EstadoProducto.DISPONIBLE || this.estado == EstadoProducto.SIN_STOCK) {
            this.estado = this.stock > 0 ? EstadoProducto.DISPONIBLE : EstadoProducto.SIN_STOCK;
        }
    }

    public void cambiarEstado(EstadoProducto nuevoEstado) {
        if (this.estado == EstadoProducto.DESCONTINUADO && nuevoEstado != EstadoProducto.DESCONTINUADO) {
            throw new IllegalArgumentException(
                    "Un producto descontinuado no puede cambiar de estado");
        }
        this.estado = nuevoEstado;
    }

    public void descontinuar() {
        this.estado = EstadoProducto.DESCONTINUADO;
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