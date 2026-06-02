package com.jeplabs.ecommerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.orden.*;
import com.jeplabs.ecommerce.infra.exceptions.*;
import com.jeplabs.ecommerce.infra.security.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.flyway.enabled=false",
        "spring.jpa.open-in-view=false",
        "spring.mail.host=localhost",
        "spring.mail.port=25",
        "api.security.secret=test-secret-key-for-testing-purposes-only",
        "api.security.expiration=3600",
        "api.impuestos.iva=0.12",
        "api.envio.monto-minimo-gratis=500.00",
        "api.carrito.expiracion-minutos=5",
        "api.carrito.notificacion-minutos-antes=3",
        "api.carrito.scheduler-intervalo=PT1H",
        "api.carrito.scheduler-delay-inicial=PT1H",
        "api.carrito.lockout-minutes=30"
})
@DisplayName("Tests de OrdenController")
class OrdenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Crear ObjectMapper directamente sin @Autowired
    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    @MockitoBean
    private OrdenService ordenService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    private DatosRespuestaOrden ordenRespuesta;
    private DatosCrearOrden datosCrearOrden;

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {

        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .sessionManagement(sm -> sm
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(req -> req
                            .requestMatchers("/api/ordenes/admin/**").hasRole("ADMIN") // ← agregar
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    @BeforeEach
    void setUp() {
        ordenRespuesta = new DatosRespuestaOrden(
                1L,
                EstadoOrden.PENDIENTE,
                1L,
                new DatosRespuestaDireccionOrden(
                        "Casa", "5ta Avenida 10-20", "Guatemala",
                        null, null, "Guatemala", "+50212345678", null),
                "Guatex",
                FormaPago.EN_LINEA,
                List.of(),
                new BigDecimal("2799.00"),
                new BigDecimal("299.89"),
                new BigDecimal("45.00"),
                new BigDecimal("2844.00"),
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        datosCrearOrden = new DatosCrearOrden(1L, 1L, FormaPago.EN_LINEA, null);
    }

    @Nested
    @DisplayName("POST /api/ordenes")
    class CrearOrdenTests {

        @Test
        @DisplayName("HTTP 201 al crear orden exitosamente")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void crear_flujoExitoso_debeRetornar201() throws Exception {
            when(ordenService.crear(anyString(), any()))
                    .thenReturn(ordenRespuesta);

            mockMvc.perform(post("/api/ordenes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(datosCrearOrden))
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                    .andExpect(jsonPath("$.servicioEnvio").value("Guatex"))
                    .andExpect(jsonPath("$.total").value(2844.00));
        }

        @Test
        @DisplayName("HTTP 400 cuando el carrito está vacío")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void crear_carritoVacio_debeRetornar400() throws Exception {
            when(ordenService.crear(anyString(), any()))
                    .thenThrow(new CarritoVacioException());

            mockMvc.perform(post("/api/ordenes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(datosCrearOrden))
                            .with(csrf()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Tu carrito está vacío"));
        }

        @Test
        @DisplayName("HTTP 400 cuando no hay carrito activo")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void crear_carritoNoEncontrado_debeRetornar400() throws Exception {
            when(ordenService.crear(anyString(), any()))
                    .thenThrow(new CarritoNoEncontradoException());

            mockMvc.perform(post("/api/ordenes")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(datosCrearOrden))
                            .with(csrf()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("No tienes un carrito activo"));
        }
    }

    @Nested
    @DisplayName("GET /api/ordenes")
    class ListarOrdenesTests {

        @Test
        @DisplayName("HTTP 200 al listar mis órdenes como CUSTOMER")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void listarMisOrdenes_comoCustomer_debeRetornar200() throws Exception {
            Page<DatosRespuestaOrden> pagina = new PageImpl<>(List.of(ordenRespuesta));
            when(ordenService.listarMisOrdenes(anyString(), any()))
                    .thenReturn(pagina);

            mockMvc.perform(get("/api/ordenes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].estado").value("PENDIENTE"));
        }

        @Test
        @DisplayName("HTTP 200 al listar todas las órdenes como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void listarTodas_comoAdmin_debeRetornar200() throws Exception {
            Page<DatosRespuestaOrden> pagina = new PageImpl<>(List.of(ordenRespuesta));
            when(ordenService.listarTodas(any(), any())).thenReturn(pagina);

            mockMvc.perform(get("/api/ordenes/admin"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("HTTP 403 al intentar listar todas las órdenes como CUSTOMER")
        @WithMockUser(roles = "CUSTOMER")
        void listarTodas_comoCustomer_debeRetornar403() throws Exception {
            // Simular que el servicio lanza AccessDeniedException
            // cuando un CUSTOMER intenta acceder a endpoint de ADMIN
            when(ordenService.listarTodas(any(), any()))
                    .thenThrow(new org.springframework.security.access.AccessDeniedException(
                            "Acceso denegado"));

            mockMvc.perform(get("/api/ordenes/admin"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/ordenes/{id}")
    class BuscarOrdenTests {

        @Test
        @DisplayName("HTTP 200 al buscar orden existente")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void buscarMiOrden_ordenExistente_debeRetornar200() throws Exception {
            when(ordenService.buscarMiOrden(anyString(), eq(1L)))
                    .thenReturn(ordenRespuesta);

            mockMvc.perform(get("/api/ordenes/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.estado").value("PENDIENTE"));
        }

        @Test
        @DisplayName("HTTP 404 al buscar orden inexistente")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void buscarMiOrden_ordenInexistente_debeRetornar404() throws Exception {
            when(ordenService.buscarMiOrden(anyString(), eq(99L)))
                    .thenThrow(new OrdenNoEncontradaException(99L));

            mockMvc.perform(get("/api/ordenes/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error")
                            .value("Orden no encontrada con ID: 99"));
        }
    }

    @Nested
    @DisplayName("PATCH /api/ordenes/admin/{id}/estado")
    class CambiarEstadoTests {

        @Test
        @DisplayName("HTTP 200 al cambiar estado como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void cambiarEstado_comoAdmin_debeRetornar200() throws Exception {
            DatosRespuestaOrden ordenConfirmada = new DatosRespuestaOrden(
                    1L, EstadoOrden.CONFIRMADA, 1L,
                    ordenRespuesta.direccionEnvio(), "Guatex",
                    FormaPago.EN_LINEA, List.of(),
                    new BigDecimal("2799.00"), new BigDecimal("299.89"),
                    new BigDecimal("45.00"), new BigDecimal("2844.00"),
                    null, LocalDateTime.now(), LocalDateTime.now()
            );

            when(ordenService.cambiarEstado(eq(1L), any()))
                    .thenReturn(ordenConfirmada);

            mockMvc.perform(patch("/api/ordenes/admin/1/estado")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"estado\": \"CONFIRMADA\"}")
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("CONFIRMADA"));
        }

        @Test
        @DisplayName("HTTP 404 al cambiar estado de orden inexistente")
        @WithMockUser(roles = "ADMIN")
        void cambiarEstado_ordenInexistente_debeRetornar404() throws Exception {
            when(ordenService.cambiarEstado(eq(99L), any()))
                    .thenThrow(new OrdenNoEncontradaException(99L));

            mockMvc.perform(patch("/api/ordenes/admin/99/estado")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"estado\": \"CONFIRMADA\"}")
                            .with(csrf()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("HTTP 403 al intentar cambiar estado como CUSTOMER")
        @WithMockUser(roles = "CUSTOMER")
        void cambiarEstado_comoCustomer_debeRetornar403() throws Exception {
            when(ordenService.cambiarEstado(any(), any()))
                    .thenThrow(new org.springframework.security.access.AccessDeniedException(
                            "Acceso denegado"));

            mockMvc.perform(patch("/api/ordenes/admin/1/estado")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"estado\": \"CONFIRMADA\"}")
                            .with(csrf()))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("PATCH /api/ordenes/{id}/cancelar")
    class CancelarOrdenTests {

        @Test
        @DisplayName("HTTP 200 al cancelar orden en PENDIENTE")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void cancelar_ordenPendiente_debeRetornar200() throws Exception {
            DatosRespuestaOrden ordenCancelada = new DatosRespuestaOrden(
                    1L, EstadoOrden.CANCELADA, 1L,
                    ordenRespuesta.direccionEnvio(), "Guatex",
                    FormaPago.EN_LINEA, List.of(),
                    new BigDecimal("2799.00"), new BigDecimal("299.89"),
                    new BigDecimal("45.00"), new BigDecimal("2844.00"),
                    null, LocalDateTime.now(), LocalDateTime.now()
            );

            when(ordenService.cancelarMiOrden(anyString(), eq(1L)))
                    .thenReturn(ordenCancelada);

            mockMvc.perform(patch("/api/ordenes/1/cancelar")
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("CANCELADA"));
        }

        @Test
        @DisplayName("HTTP 400 al cancelar orden en estado no cancelable")
        @WithMockUser(username = "usuario@test.com", roles = "CUSTOMER")
        void cancelar_ordenNoValidaParaCancelar_debeRetornar400() throws Exception {
            when(ordenService.cancelarMiOrden(anyString(), eq(1L)))
                    .thenThrow(new EstadoInvalidoException("ENVIADA", "CANCELADA"));

            mockMvc.perform(patch("/api/ordenes/1/cancelar")
                            .with(csrf()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error")
                            .value("No se puede cambiar de ENVIADA a CANCELADA"));
        }
    }
}