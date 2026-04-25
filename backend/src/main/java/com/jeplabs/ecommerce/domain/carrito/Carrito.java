package com.jeplabs.ecommerce.domain.carrito;

import com.jeplabs.ecommerce.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carritos")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    private EstadoCarrito estado;

    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CarritoItem> items = new ArrayList<>();

    private LocalDateTime creadoAt;
    private LocalDateTime actualizadoAt;

    public Carrito(Usuario usuario) {
        this.usuario = usuario;
        this.estado = EstadoCarrito.ACTIVO;
        this.creadoAt = LocalDateTime.now();
        this.actualizadoAt = LocalDateTime.now();
    }

    public void marcarComoAbandonado() {
        this.estado = EstadoCarrito.ABANDONADO;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void marcarComoConvertido() {
        this.estado = EstadoCarrito.CONVERTIDO;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void actualizarFecha() {
        this.actualizadoAt = LocalDateTime.now();
    }
}
