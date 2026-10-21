package com.jeplabs.ecommerce.domain.usuario;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "family_id", nullable = false, length = 36)
    private String familyId;

    @Column(name = "expira_at", nullable = false)
    private LocalDateTime expiraAt;

    @Column(nullable = false)
    private boolean revocado;

    @Column(name = "reemplazado_por")
    private Long reemplazadoPor;

    @Column(name = "creado_at", nullable = false)
    private LocalDateTime creadoAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    public RefreshToken(
            Usuario usuario,
            String tokenHash,
            String familyId,
            LocalDateTime expiraAt,
            String ipAddress,
            String userAgent) {
        this.usuario = usuario;
        this.tokenHash = tokenHash;
        this.familyId = familyId;
        this.expiraAt = expiraAt;
        this.revocado = false;
        this.creadoAt = LocalDateTime.now();
        this.ipAddress = ipAddress;
        this.userAgent = userAgent != null && userAgent.length() > 512
                ? userAgent.substring(0, 512)
                : userAgent;
    }

    public boolean estaExpirado() {
        return !LocalDateTime.now().isBefore(expiraAt);
    }

    public void revocar() {
        this.revocado = true;
    }

    public void marcarReemplazadoPor(Long nuevoTokenId) {
        this.revocado = true;
        this.reemplazadoPor = nuevoTokenId;
    }
}
