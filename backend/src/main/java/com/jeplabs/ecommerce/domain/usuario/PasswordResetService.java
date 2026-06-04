package com.jeplabs.ecommerce.domain.usuario;

import com.jeplabs.ecommerce.infra.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UsuarioRepository usuarioRepositorio;
    private final PasswordResetTokenRepository tokenRepositorio;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${api.security.reset-token-expiracion-minutos}")
    private long expiracionMinutos;

    @Transactional
    public void solicitarReset(DatosSolicitarReset datos) {
        // Buscar usuario por email
        // Si no existe, no revelamos que el email no está registrado
        // por seguridad devolvemos el mismo mensaje en ambos casos
        usuarioRepositorio.findByEmail(datos.email()).ifPresent(usuario -> {

            // Invalidar tokens anteriores
            tokenRepositorio.invalidarTokensAnteriores(usuario.getId());

            // Generar token único
            String token = UUID.randomUUID().toString();

            // Guardar token
            PasswordResetToken resetToken = new PasswordResetToken(
                    usuario, token, expiracionMinutos);
            tokenRepositorio.save(resetToken);

            // Enviar email
            emailService.enviarEmailRestablecimientoPassword(
                    usuario.getEmail(),
                    usuario.getNombre(),
                    token
            );
        });
    }

    @Transactional
    public void resetearPassword(DatosResetPassword datos) {
        System.out.println("Token recibido: '" + datos.token() + "'");
        PasswordResetToken resetToken = tokenRepositorio
                .findByToken(datos.token())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Token inválido o inexistente"));

        System.out.println("Token encontrado en BD: " + (resetToken != null));
        if (!resetToken.esValido()) {
            throw new IllegalArgumentException(
                    "El token ha expirado o ya fue utilizado");
        }

        // Actualizar contraseña
        Usuario usuario = resetToken.getUsuario();
        usuario.actualizarPassword(passwordEncoder.encode(datos.password()));

        // Marcar token como usado
        resetToken.marcarComoUsado();

        // Resetear intentos fallidos por si estaba bloqueado
        usuario.resetearIntentos();
    }
}
