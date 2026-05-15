package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.direccion.Direccion;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direccion_id")
    private Direccion direccion; // nullable, referencia informativa

    @Enumerated(EnumType.STRING)
    private EstadoOrden estado;

    // Copia de datos de dirección
    @Column(name = "direccion_alias")     private String direccionAlias;
    @Column(name = "direccion_calle")     private String direccionCalle;
    @Column(name = "direccion_ciudad")    private String direccionCiudad;
    @Column(name = "direccion_estado")    private String direccionEstado;
    @Column(name = "direccion_codigo_postal") private String direccionCodigoPostal;
    @Column(name = "direccion_pais")      private String direccionPais;
    @Column(name = "direccion_telefono")  private String direccionTelefono;
    @Column(name = "direccion_referencias") private String direccionReferencias;

    @Column(precision = 10, scale = 2) private BigDecimal subtotal;
    @Column(precision = 10, scale = 2) private BigDecimal iva;
    @Column(precision = 10, scale = 2) private BigDecimal total;

    private String notas;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrdenItem> items = new ArrayList<>();

    private LocalDateTime creadoAt;
    private LocalDateTime actualizadoAt;

    public Orden(Usuario usuario, Direccion direccion, String notas,
                 BigDecimal subtotal, BigDecimal iva) {
        this.usuario = usuario;
        this.direccion = direccion;
        this.estado = EstadoOrden.PENDIENTE;

        // Copia de datos de dirección al momento de la orden
        this.direccionAlias          = direccion.getAlias();
        this.direccionCalle          = direccion.getDireccion();
        this.direccionCiudad         = direccion.getCiudad();
        this.direccionEstado         = direccion.getEstado();
        this.direccionCodigoPostal   = direccion.getCodigoPostal();
        this.direccionPais           = direccion.getPais();
        this.direccionTelefono       = direccion.getTelefono();
        this.direccionReferencias    = direccion.getReferencias();

        this.subtotal     = subtotal;
        this.iva          = iva;
        this.total        = subtotal; // total = subtotal porque IVA ya está incluido
        this.notas        = notas;
        this.creadoAt     = LocalDateTime.now();
        this.actualizadoAt = LocalDateTime.now();
    }

    public void cambiarEstado(EstadoOrden nuevoEstado) {
        if (!this.estado.puedeTransicionarA(nuevoEstado)) {
            throw new IllegalArgumentException(
                    "No se puede cambiar de " + this.estado + " a " + nuevoEstado);
        }
        this.estado = nuevoEstado;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void cancelar() {
        if (!this.estado.esCancelable()) {
            throw new IllegalArgumentException(
                    "Solo se pueden cancelar órdenes en estado PENDIENTE o CONFIRMADA");
        }
        this.estado = EstadoOrden.CANCELADA;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void actualizarTotales(BigDecimal subtotal, BigDecimal iva) {
        this.subtotal = subtotal;
        this.iva = iva;
        this.total = subtotal; // total = subtotal porque IVA ya está incluido
        this.actualizadoAt = LocalDateTime.now();
    }
}
