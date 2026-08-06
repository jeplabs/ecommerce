package com.jeplabs.ecommerce.domain.pago.webpay;

import com.jeplabs.ecommerce.domain.orden.Orden;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "webpay_transacciones")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class WebpayTransaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private Orden orden;

    private String token;
    private String buyOrder;
    private String sessionId;

    @Column(precision = 10, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    private EstadoWebpayTransaccion estado;

    @Enumerated(EnumType.STRING)
    private MotivoRechazoWebpay motivo;

    private Byte responseCode;
    private String authorizationCode;
    private String transactionId;
    private String cardNumber;
    private String paymentTypeCode;
    private Byte installments;

    @Column(length = 500)
    private String url; // ← URL del formulario guardada para reutilizar

    private LocalDateTime creadoAt;
    private LocalDateTime actualizadoAt;

    public WebpayTransaccion(Orden orden, String token, String buyOrder,
                             String sessionId, BigDecimal monto, String url) {
        this.orden         = orden;
        this.token         = token;
        this.buyOrder      = buyOrder;
        this.sessionId     = sessionId;
        this.monto         = monto;
        this.url           = url;
        this.estado        = EstadoWebpayTransaccion.INICIADA;
        this.creadoAt      = LocalDateTime.now();
        this.actualizadoAt = LocalDateTime.now();
    }

    public void aprobar(String transactionId, String authorizationCode,
                        String cardNumber, String paymentTypeCode,
                        Byte installments, Byte responseCode) {
        this.estado            = EstadoWebpayTransaccion.APROBADA;
        this.transactionId     = transactionId;
        this.authorizationCode = authorizationCode;
        this.cardNumber        = cardNumber;
        this.paymentTypeCode   = paymentTypeCode;
        this.installments      = installments;
        this.responseCode      = responseCode;
        this.actualizadoAt     = LocalDateTime.now();
    }

    public void rechazar(MotivoRechazoWebpay motivo, Byte responseCode) {
        this.estado = switch (motivo) {
            case ABORTED -> EstadoWebpayTransaccion.ABORTADA;
            case TIMEOUT -> EstadoWebpayTransaccion.TIMEOUT;
            default      -> EstadoWebpayTransaccion.RECHAZADA;
        };
        this.motivo        = motivo;
        this.responseCode  = responseCode;
        this.actualizadoAt = LocalDateTime.now();
    }

    public boolean estaAprobada()  { return estado == EstadoWebpayTransaccion.APROBADA; }
    public boolean estaIniciada()  { return estado == EstadoWebpayTransaccion.INICIADA; }
    public boolean estaTerminada() {
        return estado == EstadoWebpayTransaccion.APROBADA   ||
                estado == EstadoWebpayTransaccion.RECHAZADA  ||
                estado == EstadoWebpayTransaccion.ABORTADA   ||
                estado == EstadoWebpayTransaccion.TIMEOUT;
    }
}