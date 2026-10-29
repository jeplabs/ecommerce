package com.jeplabs.ecommerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.sucursal.*;
import com.jeplabs.ecommerce.infra.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Tests de SucursalController")
class SucursalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    @MockitoBean
    private SucursalService sucursalService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    private DatosRespuestaSucursal sucursalRespuesta;

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
                            .requestMatchers(HttpMethod.GET, "/api/sucursales").permitAll()
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    @BeforeEach
    void setUp() {
        sucursalRespuesta = new DatosRespuestaSucursal(
                1L,
                "Tienda Centro",
                "Av. Principal 123, Ciudad de Guatemala",
                "Ciudad de Guatemala",
                "Guatemala",
                "01001",
                "GT",
                "+502 2345-6789",
                "Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00",
                "Zona 1, Centro Histórico",
                null,
                true,
                1,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("GET /api/sucursales (Público)")
    class ListarActivasTests {

        @Test
        @DisplayName("HTTP 200 al listar sucursales activas sin autenticación")
        void listarActivas_sinToken_debeRetornar200() throws Exception {
            when(sucursalService.listarActivas())
                    .thenReturn(List.of(sucursalRespuesta));

            mockMvc.perform(get("/api/sucursales"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].nombre").value("Tienda Centro"))
                    .andExpect(jsonPath("$[0].direccion").value("Av. Principal 123, Ciudad de Guatemala"))
                    .andExpect(jsonPath("$[0].horario").value("Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00"))
                    .andExpect(jsonPath("$[0].telefono").value("+502 2345-6789"));
        }
    }

    @Nested
    @DisplayName("Endpoints de administración (/api/sucursales/**)")
    class AdminSucursalesTests {

        @Test
        @DisplayName("HTTP 200 al crear sucursal como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void crear_comoAdmin_debeRetornar200() throws Exception {
            DatosCrearSucursal crearDto = new DatosCrearSucursal(
                    "Tienda Centro",
                    "Av. Principal 123, Ciudad de Guatemala",
                    "Ciudad de Guatemala",
                    "Guatemala",
                    "01001",
                    "GT",
                    "+502 2345-6789",
                    "Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00",
                    "Zona 1",
                    null,
                    1
            );

            when(sucursalService.crear(any())).thenReturn(sucursalRespuesta);

            mockMvc.perform(post("/api/sucursales")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(crearDto))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nombre").value("Tienda Centro"));
        }

        @Test
        @DisplayName("HTTP 400 al crear sucursal con campos obligatorios vacíos")
        @WithMockUser(roles = "ADMIN")
        void crear_datosInvalidos_debeRetornar400() throws Exception {
            DatosCrearSucursal invalido = new DatosCrearSucursal(
                    "", "", "", null, null, "", "", "", null, null, 0
            );

            mockMvc.perform(post("/api/sucursales")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("HTTP 204 al desactivar sucursal como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void desactivar_comoAdmin_debeRetornar204() throws Exception {
            doNothing().when(sucursalService).desactivar(eq(1L));

            mockMvc.perform(delete("/api/sucursales/1").with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }
}
