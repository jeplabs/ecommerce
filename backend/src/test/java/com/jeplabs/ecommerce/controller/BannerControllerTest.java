package com.jeplabs.ecommerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.banner.*;
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
@DisplayName("Tests de BannerController")
class BannerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    @MockitoBean
    private BannerService bannerService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    private DatosRespuestaBanner bannerRespuesta;

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
                            .requestMatchers(HttpMethod.GET, "/api/banners").permitAll()
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    @BeforeEach
    void setUp() {
        LocalDateTime ahora = LocalDateTime.now();
        bannerRespuesta = new DatosRespuestaBanner(
                1L,
                SeccionBanner.HERO_CAROUSEL,
                "Promoción de verano",
                "https://res.cloudinary.com/demo/image/upload/banner-desktop.webp",
                "https://res.cloudinary.com/demo/image/upload/banner-mobile.webp",
                "/categoria/computacion",
                1,
                true,
                ahora.minusDays(1),
                ahora.plusDays(15),
                ahora,
                ahora
        );
    }

    @Nested
    @DisplayName("GET /api/banners (Público)")
    class PublicoTests {

        @Test
        @DisplayName("HTTP 200 al listar banners vigentes sin autenticación")
        void listarVigentes_sinToken_debeRetornar200() throws Exception {
            when(bannerService.listarVigentes(SeccionBanner.HERO_CAROUSEL))
                    .thenReturn(List.of(bannerRespuesta));

            mockMvc.perform(get("/api/banners").param("seccion", "HERO_CAROUSEL"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].titulo").value("Promoción de verano"))
                    .andExpect(jsonPath("$[0].seccion").value("HERO_CAROUSEL"));
        }
    }

    @Nested
    @DisplayName("Endpoints de administración (/api/banners/**)")
    class AdminTests {

        @Test
        @DisplayName("HTTP 403 al acceder a /api/banners/admin con rol CUSTOMER")
        @WithMockUser(roles = "CUSTOMER")
        void listarAdmin_comoCustomer_debeRetornar403() throws Exception {
            mockMvc.perform(get("/api/banners/admin"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("HTTP 200 al listar banners en /api/banners/admin como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void listarAdmin_comoAdmin_debeRetornar200() throws Exception {
            when(bannerService.listarAdmin(null)).thenReturn(List.of(bannerRespuesta));

            mockMvc.perform(get("/api/banners/admin"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1));
        }

        @Test
        @DisplayName("HTTP 201 al crear banner como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void crear_comoAdmin_debeRetornar201() throws Exception {
            DatosCrearBanner crearDto = new DatosCrearBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "Promoción de verano",
                    "https://res.cloudinary.com/demo/image/upload/banner-desktop.webp",
                    "https://res.cloudinary.com/demo/image/upload/banner-mobile.webp",
                    "/categoria/computacion",
                    1,
                    true,
                    null,
                    null
            );

            when(bannerService.crear(any())).thenReturn(bannerRespuesta);

            mockMvc.perform(post("/api/banners")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(crearDto))
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.titulo").value("Promoción de verano"));
        }

        @Test
        @DisplayName("HTTP 400 al crear banner con campos obligatorios vacíos")
        @WithMockUser(roles = "ADMIN")
        void crear_datosInvalidos_debeRetornar400() throws Exception {
            DatosCrearBanner invalido = new DatosCrearBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "",
                    "",
                    null,
                    null,
                    0,
                    true,
                    null,
                    null
            );

            mockMvc.perform(post("/api/banners")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalido))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("HTTP 200 al actualizar banner como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void actualizar_comoAdmin_debeRetornar200() throws Exception {
            DatosActualizarBanner actualizarDto = new DatosActualizarBanner(
                    SeccionBanner.HERO_CAROUSEL,
                    "Promoción actualizada",
                    "https://res.cloudinary.com/demo/image/upload/banner-desktop.webp",
                    null,
                    "/catalogo",
                    1,
                    true,
                    null,
                    null
            );

            when(bannerService.actualizar(eq(1L), any())).thenReturn(bannerRespuesta);

            mockMvc.perform(put("/api/banners/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(actualizarDto))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        @DisplayName("HTTP 200 al alternar estado del banner como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void toggleActivo_comoAdmin_debeRetornar200() throws Exception {
            when(bannerService.toggleActivo(1L)).thenReturn(bannerRespuesta);

            mockMvc.perform(patch("/api/banners/1/estado").with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        @DisplayName("HTTP 200 al reordenar banners como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void reordenar_comoAdmin_debeRetornar200() throws Exception {
            when(bannerService.reordenar(any())).thenReturn(List.of(bannerRespuesta));

            mockMvc.perform(put("/api/banners/reordenar")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new DatosReordenarBanners(List.of(1L))))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1));
        }

        @Test
        @DisplayName("HTTP 400 al reordenar con lista vacía")
        @WithMockUser(roles = "ADMIN")
        void reordenar_listaVacia_debeRetornar400() throws Exception {
            mockMvc.perform(put("/api/banners/reordenar")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new DatosReordenarBanners(List.of())))
                            .with(csrf()))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("HTTP 204 al eliminar banner como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void eliminar_comoAdmin_debeRetornar204() throws Exception {
            doNothing().when(bannerService).eliminar(1L);

            mockMvc.perform(delete("/api/banners/1").with(csrf()))
                    .andExpect(status().isNoContent());
        }
    }
}
