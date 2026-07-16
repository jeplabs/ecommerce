package com.jeplabs.ecommerce.domain.orden;

import com.jeplabs.ecommerce.domain.direccion.Direccion;
import com.jeplabs.ecommerce.domain.envio.ServicioEnvio;
import com.jeplabs.ecommerce.domain.pago.MetodoPago;
import com.jeplabs.ecommerce.domain.pago.TipoMetodoPago;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.infra.exceptions.EstadoInvalidoException;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servicio_envio_id")
    private ServicioEnvio servicioEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pago_envio")
    private FormaPagoEnvio formaPagoEnvio;

    @Column(name = "costo_envio", precision = 10, scale = 2)
    private BigDecimal costoEnvio;

    @Enumerated(EnumType.STRING)
    private EstadoOrden estado;

    @Column(name = "metodo_pago")
    private String metodoPagoCodigo; // ← código del método elegido

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metodo_pago", referencedColumnName = "codigo",
            insertable = false, updatable = false)
            MetodoPago metodoPago; // ← referencia

    @Column(name = "comprobante_url")
    private String comprobanteUrl;

    @Column(name = "comprobante_nombre")
    private String comprobanteNombre;

    @Column(name = "comprobante_fecha")
    private LocalDateTime comprobanteFecha;

    @Column(name = "nota_envio")
    private String notaEnvio;

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

    public Orden(Usuario usuario, Direccion direccion, ServicioEnvio servicioEnvio, FormaPagoEnvio formaPagoEnvio,
                 String metodoPagoCodigo,
                 BigDecimal costoEnvio, String notas,
                 BigDecimal subtotal, BigDecimal iva) {
        this.usuario = usuario;
        this.direccion = direccion;
        this.servicioEnvio = servicioEnvio;
        this.formaPagoEnvio = formaPagoEnvio;
        this.costoEnvio = costoEnvio;
        this.notaEnvio = generarNotaEnvio(formaPagoEnvio, servicioEnvio);
        this.estado = EstadoOrden.PENDIENTE;
        this.metodoPagoCodigo = metodoPagoCodigo;

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
        this.total        = subtotal.add(costoEnvio); // total = subtotal porque IVA ya está incluido
                                                      // agrega el costo del envío.
        this.notas        = notas;
        this.creadoAt     = LocalDateTime.now();
        this.actualizadoAt = LocalDateTime.now();
    }

    public void cambiarEstado(EstadoOrden nuevoEstado) {
        if (!this.estado.puedeTransicionarA(nuevoEstado)) {
            throw new EstadoInvalidoException(
                    this.estado.name(), nuevoEstado.name());
        }
        this.estado = nuevoEstado;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void cancelar() {
        if (!this.estado.esCancelable()) {
            throw new EstadoInvalidoException(
                    this.estado.name(), EstadoOrden.CANCELADA.name());
        }
        this.estado = EstadoOrden.CANCELADA;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void actualizarTotales(BigDecimal subtotal, BigDecimal iva, BigDecimal costoEnvio) {
        this.subtotal = subtotal;
        this.iva = iva;
        this.costoEnvio = costoEnvio;
        this.total = subtotal.add(costoEnvio); // total = subtotal porque IVA ya está incluido
        this.actualizadoAt = LocalDateTime.now();
    }

    public void agregarComprobante(String url, String nombre) {
        this.comprobanteUrl    = url;
        this.comprobanteNombre = nombre;
        this.comprobanteFecha  = LocalDateTime.now();
    }

    public TipoMetodoPago getTipoMetodoPago() {
        return metodoPago != null ? metodoPago.getTipo() : null;
    }

    private String generarNotaEnvio(FormaPagoEnvio formaPagoEnvio,
                                    ServicioEnvio servicioEnvio) {
        if (formaPagoEnvio == FormaPagoEnvio.CONTRA_ENTREGA) {
            return "El envío se paga de manera adicional al valor de la compra al recibir el producto";
        }
        if (servicioEnvio.isServicioExpress()) {
            return "Servicio express - entrega prioritaria";
        }
        return null;
    }

}
