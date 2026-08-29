package com.jeplabs.ecommerce.domain.favorito;

import com.jeplabs.ecommerce.domain.producto.Producto;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "favoritos")
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class Favorito {

    @EmbeddedId
    private FavoritoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("usuarioId")
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productoId")
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @Column(name = "creado_at", updatable = false)
    private LocalDateTime creadoAt;

    public Favorito(Usuario usuario, Producto producto) {
        this.id = new FavoritoId(usuario.getId(), producto.getId());
        this.usuario = usuario;
        this.producto = producto;
        this.creadoAt = LocalDateTime.now();
    }
}
