package com.jeplabs.ecommerce.domain.usuario;

import com.jeplabs.ecommerce.infra.exceptions.RefreshTokenInvalidoException;
import com.jeplabs.ecommerce.infra.security.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final int RAW_TOKEN_BYTES = 32; // 256 bits de entropía
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenService tokenService;

    @Value("${api.security.refresh-expiration-cliente-days:14}")
    private long refreshDaysCliente;

    @Value("${api.security.refresh-expiration-admin-days:1}")
    private long refreshDaysAdmin;

    public record ResultadoEmisionTokens(
            String accessToken,
            String rawRefreshToken,
            long refreshMaxAgeSeconds,
            Usuario usuario
    ) {}

    /**
     * Crea una nueva familia de sesión al iniciar sesión (Login).
     */
    @Transactional
    public ResultadoEmisionTokens emitirNuevaSesion(Usuario usuario, String ipAddress, String userAgent) {
        String familyId = UUID.randomUUID().toString();
        return emitirTokensEnFamilia(usuario, familyId, ipAddress, userAgent);
    }

    /**
     * Rota un Refresh Token existente, verificando expiración, estado del usuario
     * y detección de reutilización (robo de sesión).
     */
    @Transactional(noRollbackFor = RefreshTokenInvalidoException.class)
    public ResultadoEmisionTokens rotarToken(String rawRefreshToken, String ipAddress, String userAgent) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new RefreshTokenInvalidoException("No se proporcionó un token de actualización");
        }

        String hash = calcularSha256(rawRefreshToken);
        RefreshToken almacenado = refreshTokenRepository.findByTokenHashForUpdate(hash)
                .orElseThrow(() -> new RefreshTokenInvalidoException("Token de actualización inválido"));

        // 1. Detección de reutilización (Token Reuse Detection)
        if (almacenado.isRevocado()) {
            int revocados = refreshTokenRepository.revocarFamilia(almacenado.getFamilyId());
            log.warn("[Seguridad] Reutilización de Refresh Token detectada para usuarioId={} familyId={}. " +
                            "Se revocaron {} tokens activos de la familia. IP={}",
                    almacenado.getUsuario().getId(), almacenado.getFamilyId(), revocados, ipAddress);
            throw new RefreshTokenInvalidoException("Sesión invalidada por motivos de seguridad. Inicia sesión nuevamente.");
        }

        // 2. Verificar expiración
        if (almacenado.estaExpirado()) {
            almacenado.revocar();
            throw new RefreshTokenInvalidoException("Tu sesión ha expirado. Inicia sesión nuevamente.");
        }

        Usuario usuario = almacenado.getUsuario();

        // 3. Verificar que el usuario siga activo y no bloqueado
        if (!usuario.isActivo()) {
            refreshTokenRepository.revocarTodosPorUsuario(usuario.getId());
            throw new RefreshTokenInvalidoException("Tu cuenta ha sido desactivada.");
        }

        // 4. Emitir nuevo par de tokens en la misma familia y marcar el anterior como reemplazado
        String nuevoRawRefresh = generarTokenOpaco();
        String nuevoHash = calcularSha256(nuevoRawRefresh);
        long diasValidez = obtenerDiasExpiracion(usuario);
        LocalDateTime nuevaExpiracion = LocalDateTime.now().plusDays(diasValidez);

        RefreshToken nuevoToken = new RefreshToken(
                usuario,
                nuevoHash,
                almacenado.getFamilyId(),
                nuevaExpiracion,
                ipAddress,
                userAgent
        );
        refreshTokenRepository.save(nuevoToken);
        almacenado.marcarReemplazadoPor(nuevoToken.getId());

        String nuevoAccessToken = tokenService.generarToken(usuario);
        long maxAgeSeconds = diasValidez * 24 * 60 * 60;

        return new ResultadoEmisionTokens(nuevoAccessToken, nuevoRawRefresh, maxAgeSeconds, usuario);
    }

    /**
     * Revoca la familia de sesión asociada al Refresh Token enviado en el logout.
     */
    @Transactional
    public void revocarPorRawToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        String hash = calcularSha256(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            refreshTokenRepository.revocarFamilia(token.getFamilyId());
        });
    }

    /**
     * Revoca todas las sesiones activas de un usuario en todos sus dispositivos
     * (ej. cambio/reset de contraseña, cambio de rol, desactivación o logout-all).
     */
    @Transactional
    public int revocarTodasLasSesionesUsuario(Long usuarioId) {
        return refreshTokenRepository.revocarTodosPorUsuario(usuarioId);
    }

    private ResultadoEmisionTokens emitirTokensEnFamilia(
            Usuario usuario,
            String familyId,
            String ipAddress,
            String userAgent) {

        String rawRefreshToken = generarTokenOpaco();
        String hash = calcularSha256(rawRefreshToken);
        long diasValidez = obtenerDiasExpiracion(usuario);
        LocalDateTime expiraAt = LocalDateTime.now().plusDays(diasValidez);

        RefreshToken entidad = new RefreshToken(
                usuario,
                hash,
                familyId,
                expiraAt,
                ipAddress,
                userAgent
        );
        refreshTokenRepository.save(entidad);

        String accessToken = tokenService.generarToken(usuario);
        long maxAgeSeconds = diasValidez * 24 * 60 * 60;

        return new ResultadoEmisionTokens(accessToken, rawRefreshToken, maxAgeSeconds, usuario);
    }

    public long obtenerDiasExpiracion(Usuario usuario) {
        if (usuario.getRol() == Rol.ROLE_ADMIN) {
            return refreshDaysAdmin;
        }
        return refreshDaysCliente;
    }

    private String generarTokenOpaco() {
        byte[] bytes = new byte[RAW_TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String calcularSha256(String valor) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(valor.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algoritmo SHA-256 no disponible en la JVM", e);
        }
    }
}
