package com.jeplabs.ecommerce.domain.usuario;

import com.jeplabs.ecommerce.infra.exceptions.RefreshTokenInvalidoException;
import com.jeplabs.ecommerce.infra.security.RefreshCookieHelper;
import com.jeplabs.ecommerce.infra.security.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de Arquitectura de Doble Token (RefreshTokenService y RefreshCookieHelper)")
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private TokenService tokenService;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    private Usuario cliente;
    private Usuario admin;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshDaysCliente", 14L);
        ReflectionTestUtils.setField(refreshTokenService, "refreshDaysAdmin", 1L);

        cliente = new Usuario(
                1L,
                "Juan",
                "Pérez",
                "Guatemala",
                "juan@test.com",
                "hashed_pwd",
                Rol.ROLE_CUSTOMER,
                true,
                0,
                false,
                null
        );

        admin = new Usuario(
                2L,
                "Admin",
                "Root",
                "Guatemala",
                "admin@test.com",
                "hashed_pwd",
                Rol.ROLE_ADMIN,
                true,
                0,
                false,
                null
        );
    }

    @Nested
    @DisplayName("Emisión de sesión inicial")
    class EmisionSesion {

        @Test
        @DisplayName("Guarda únicamente el hash SHA-256 en BD y calcula expiración según rol CUSTOMER (14 días)")
        void emitirNuevaSesion_cliente_guardaHashSha256() {
            when(tokenService.generarToken(cliente)).thenReturn("jwt-access-cliente");

            var resultado = refreshTokenService.emitirNuevaSesion(cliente, "192.168.1.10", "Mozilla/5.0");

            ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository).save(captor.capture());

            RefreshToken guardado = captor.getValue();
            assertThat(resultado.accessToken()).isEqualTo("jwt-access-cliente");
            assertThat(resultado.rawRefreshToken()).isNotBlank();
            assertThat(guardado.getTokenHash())
                    .hasSize(64)
                    .isNotEqualTo(resultado.rawRefreshToken())
                    .isEqualTo(refreshTokenService.calcularSha256(resultado.rawRefreshToken()));
            assertThat(guardado.isRevocado()).isFalse();
            assertThat(resultado.refreshMaxAgeSeconds()).isEqualTo(14L * 24 * 60 * 60);
        }

        @Test
        @DisplayName("Calcula expiración corta de 1 día cuando el usuario tiene rol ADMIN")
        void emitirNuevaSesion_admin_expiracionCorta() {
            when(tokenService.generarToken(admin)).thenReturn("jwt-access-admin");

            var resultado = refreshTokenService.emitirNuevaSesion(admin, "10.0.0.1", "Chrome");

            assertThat(resultado.refreshMaxAgeSeconds()).isEqualTo(1L * 24 * 60 * 60);
        }
    }

    @Nested
    @DisplayName("Rotación y Detección de Reutilización (Robo de Token)")
    class RotacionYReuso {

        @Test
        @DisplayName("Rotación exitosa invalida el token anterior, conserva el familyId y emite nuevo par")
        void rotarToken_valido_rotaEnMismaFamilia() {
            String rawAnterior = "token-crudo-anterior";
            String hashAnterior = refreshTokenService.calcularSha256(rawAnterior);
            String familyId = UUID.randomUUID().toString();

            RefreshToken tokenAnterior = new RefreshToken(
                    10L,
                    cliente,
                    hashAnterior,
                    familyId,
                    LocalDateTime.now().plusDays(10),
                    false,
                    null,
                    LocalDateTime.now().minusMinutes(15),
                    "127.0.0.1",
                    "TestAgent"
            );

            when(refreshTokenRepository.findByTokenHashForUpdate(hashAnterior))
                    .thenReturn(Optional.of(tokenAnterior));
            when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
                RefreshToken nuevo = inv.getArgument(0);
                ReflectionTestUtils.setField(nuevo, "id", 11L);
                return nuevo;
            });
            when(tokenService.generarToken(cliente)).thenReturn("nuevo-access-jwt");

            var resultado = refreshTokenService.rotarToken(rawAnterior, "127.0.0.1", "TestAgent");

            assertThat(tokenAnterior.isRevocado()).isTrue();
            assertThat(tokenAnterior.getReemplazadoPor()).isEqualTo(11L);
            assertThat(resultado.accessToken()).isEqualTo("nuevo-access-jwt");
            assertThat(resultado.rawRefreshToken()).isNotEqualTo(rawAnterior);

            ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
            verify(refreshTokenRepository).save(captor.capture());
            assertThat(captor.getValue().getFamilyId()).isEqualTo(familyId);
        }

        @Test
        @DisplayName("Detección de reúso: si llega un token ya revocado, revoca toda la familia y lanza excepción")
        void rotarToken_yaRevocado_revocaTodaLaFamilia() {
            String rawRobado = "token-ya-usado";
            String hashRobado = refreshTokenService.calcularSha256(rawRobado);
            String familyId = UUID.randomUUID().toString();

            RefreshToken tokenYaUsado = new RefreshToken(
                    20L,
                    cliente,
                    hashRobado,
                    familyId,
                    LocalDateTime.now().plusDays(5),
                    true, // Ya había sido rotado/revocado
                    21L,
                    LocalDateTime.now().minusHours(1),
                    "127.0.0.1",
                    "TestAgent"
            );

            when(refreshTokenRepository.findByTokenHashForUpdate(hashRobado))
                    .thenReturn(Optional.of(tokenYaUsado));

            assertThatThrownBy(() -> refreshTokenService.rotarToken(rawRobado, "185.10.10.1", "AttackerAgent"))
                    .isInstanceOf(RefreshTokenInvalidoException.class)
                    .hasMessageContaining("seguridad");

            verify(refreshTokenRepository).revocarFamilia(familyId);
            verify(tokenService, never()).generarToken(any());
        }

        @Test
        @DisplayName("Rechaza la renovación y revoca sesiones si el usuario fue desactivado")
        void rotarToken_usuarioDesactivado_revocaSesionesYLanzaExcepcion() {
            cliente.desactivar();
            String rawToken = "token-usuario-inactivo";
            String hash = refreshTokenService.calcularSha256(rawToken);

            RefreshToken almacenado = new RefreshToken(
                    30L,
                    cliente,
                    hash,
                    UUID.randomUUID().toString(),
                    LocalDateTime.now().plusDays(5),
                    false,
                    null,
                    LocalDateTime.now().minusMinutes(5),
                    "127.0.0.1",
                    "Browser"
            );

            when(refreshTokenRepository.findByTokenHashForUpdate(hash))
                    .thenReturn(Optional.of(almacenado));

            assertThatThrownBy(() -> refreshTokenService.rotarToken(rawToken, "127.0.0.1", "Browser"))
                    .isInstanceOf(RefreshTokenInvalidoException.class)
                    .hasMessageContaining("desactivada");

            verify(refreshTokenRepository).revocarTodosPorUsuario(cliente.getId());
        }
    }

    @Nested
    @DisplayName("Gestión de Cookie HttpOnly (RefreshCookieHelper)")
    class CookieHttpOnly {

        @Test
        @DisplayName("Escribe y limpia la Cookie HttpOnly con Path=/api/auth y atributos de seguridad")
        void refreshCookieHelper_escribeYLimpiaCookieCorrectamente() {
            RefreshCookieHelper cookieHelper = new RefreshCookieHelper();
            ReflectionTestUtils.setField(cookieHelper, "cookieName", "refresh_token");
            ReflectionTestUtils.setField(cookieHelper, "cookieSecure", true);
            ReflectionTestUtils.setField(cookieHelper, "cookieSameSite", "Strict");
            ReflectionTestUtils.setField(cookieHelper, "cookiePath", "/api/auth");

            MockHttpServletResponse responseLogin = new MockHttpServletResponse();
            cookieHelper.escribirCookieRefresh(responseLogin, "valor-opaco-123", 1209600L);

            String setCookieHeader = responseLogin.getHeader(HttpHeaders.SET_COOKIE);
            assertThat(setCookieHeader)
                    .contains("refresh_token=valor-opaco-123")
                    .contains("Path=/api/auth")
                    .contains("HttpOnly")
                    .contains("Secure")
                    .contains("SameSite=Strict")
                    .contains("Max-Age=1209600");

            MockHttpServletResponse responseLogout = new MockHttpServletResponse();
            cookieHelper.limpiarCookieRefresh(responseLogout);
            String clearHeader = responseLogout.getHeader(HttpHeaders.SET_COOKIE);
            assertThat(clearHeader)
                    .contains("refresh_token=")
                    .contains("Max-Age=0")
                    .contains("HttpOnly");

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new jakarta.servlet.http.Cookie("refresh_token", "valor-opaco-123"));
            assertThat(cookieHelper.extraerRefreshToken(request)).contains("valor-opaco-123");
        }
    }
}
