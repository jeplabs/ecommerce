package com.jeplabs.ecommerce.domain.usuario;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private String token;
    private LocalDateTime expiraAt;
    private boolean usado;
    private LocalDateTime creadoAt;

    public PasswordResetToken(Usuario usuario, String token, long minutosExpiracion) {
        this.usuario    = usuario;
        this.token      = token;
        this.expiraAt   = LocalDateTime.now().plusMinutes(minutosExpiracion);
        this.usado      = false;
        this.creadoAt   = LocalDateTime.now();
    }

    public boolean estaExpirado() {
        return LocalDateTime.now().isAfter(expiraAt);
    }

    public boolean esValido() {
        return !usado && !estaExpirado();
    }

    public void marcarComoUsado() {
        this.usado = true;
    }
}