package com.jeplabs.ecommerce.domain.pago.qpaypro;

import com.jeplabs.ecommerce.domain.orden.Orden;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "qpaypro_transacciones")
@Getter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class QPayProTransaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private Orden orden;

    private String token;
    
    @Column(name = "transaction_id")
    private String transactionId;

    @Enumerated(EnumType.STRING)
    private EstadoQPayPro estado;

    private BigDecimal monto;
    
    @Column(name = "md5_hash_response")
    private String md5HashResponse;

    private Integer cuotas;

    // Facturación Electrónica (FEL)
    @Column(name = "fel_uuid")
    private String felUuid;
    
    @Column(name = "fel_serie")
    private String felSerie;
    
    @Column(name = "fel_numero")
    private String felNumero;

    @Column(name = "creado_at", updatable = false)
    private LocalDateTime creadoAt;

    @Column(name = "actualizado_at")
    private LocalDateTime actualizadoAt;

    public QPayProTransaccion(Orden orden, BigDecimal monto, Integer cuotas) {
        this.orden = orden;
        this.monto = monto;
        this.estado = EstadoQPayPro.PENDIENTE;
        this.cuotas = cuotas;
        this.creadoAt = LocalDateTime.now();
    }

    public void actualizarToken(String token) {
        this.token = token;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void marcarComoAprobada(String transactionId, String md5HashResponse) {
        this.estado = EstadoQPayPro.APROBADA;
        this.transactionId = transactionId;
        this.md5HashResponse = md5HashResponse;
        this.actualizadoAt = LocalDateTime.now();
    }

    public void marcarComoDenegada(String md5HashResponse) {
        this.estado = EstadoQPayPro.DENEGADA;
        this.md5HashResponse = md5HashResponse;
        this.actualizadoAt = LocalDateTime.now();
    }
    
    public void marcarComoAnulada() {
        this.estado = EstadoQPayPro.ANULADA;
        this.actualizadoAt = LocalDateTime.now();
    }
    
    public void guardarDatosFel(String felUuid, String felSerie, String felNumero) {
        this.felUuid = felUuid;
        this.felSerie = felSerie;
        this.felNumero = felNumero;
        this.actualizadoAt = LocalDateTime.now();
    }
}
