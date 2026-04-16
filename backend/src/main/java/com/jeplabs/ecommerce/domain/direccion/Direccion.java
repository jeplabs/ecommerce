package com.jeplabs.ecommerce.domain.direccion;

import com.jeplabs.ecommerce.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "direcciones")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Direccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String alias;
    private String direccion;
    private String ciudad;
    private String estado;
    private String codigoPostal;
    private String pais;
    private String telefono;
    private String referencias;
    private boolean principal;
    private boolean activo;

    public Direccion(Usuario usuario, DatosCrearDireccion datos) {
        this.usuario = usuario;
        this.alias = datos.alias();
        this.direccion = datos.direccion();
        this.ciudad = datos.ciudad();
        this.estado = datos.estado();
        this.codigoPostal = datos.codigoPostal();
        this.pais = datos.pais();
        this.telefono = datos.telefono();
        this.referencias = datos.referencias();
        this.principal = datos.principal();
        this.activo = true;
    }

    public void actualizar(DatosActualizarDireccion datos) {
        if (datos.alias() != null) this.alias = datos.alias();
        if (datos.direccion() != null) this.direccion = datos.direccion();
        if (datos.ciudad() != null) this.ciudad = datos.ciudad();
        if (datos.estado() != null) this.estado = datos.estado();
        if (datos.codigoPostal() != null) this.codigoPostal = datos.codigoPostal();
        if (datos.pais() != null) this.pais = datos.pais();
        if (datos.telefono() != null) this.telefono = datos.telefono();
    }

    public void marcarComoPrincipal() {
        this.principal = true;
    }

    public void quitarPrincipal() {
        this.principal = false;
    }

    public void desactivar() {
        this.activo = false;
        this.principal = false; // si era principal, quita el flag
    }
}
