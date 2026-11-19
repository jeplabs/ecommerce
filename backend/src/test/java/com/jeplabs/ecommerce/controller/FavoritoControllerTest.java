package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.favorito.DatosRespuestaFavorito;
import com.jeplabs.ecommerce.domain.favorito.FavoritoService;
import com.jeplabs.ecommerce.infra.security.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Tests de FavoritoController")
class FavoritoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FavoritoService favoritoService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    @TestConfiguration
    @EnableMethodSecurity
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
            return http
                    .csrf(csrf -> csrf.disable())
                    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(req -> req.anyRequest().authenticated())
                    .build();
        }
    }

    @Nested
    @DisplayName("GET /api/favoritos")
    class ListarFavoritosEndpointTests {

        @Test
        @WithMockUser(username = "cliente@example.com", roles = "CUSTOMER")
        @DisplayName("Retorna página de favoritos con tamaño y página solicitados")
        void listar_paginado_retorna200() throws Exception {
            DatosRespuestaFavorito item = new DatosRespuestaFavorito(
                    100L, "mouse-gamer", "Mouse Gamer",
                    new BigDecimal("350.00"), "GTQ", "https://cdn.example.com/mouse.jpg",
                    LocalDateTime.now()
            );
            when(favoritoService.listarFavoritos(eq("cliente@example.com"), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 12), 1));

            mockMvc.perform(get("/api/favoritos")
                            .param("page", "0")
                            .param("size", "12"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].productId").value(100))
                    .andExpect(jsonPath("$.content[0].nombre").value("Mouse Gamer"))
                    .andExpect(jsonPath("$.page.totalElements").value(1))
                    .andExpect(jsonPath("$.page.totalPages").value(1))
                    .andExpect(jsonPath("$.page.number").value(0))
                    .andExpect(jsonPath("$.page.size").value(12));

            verify(favoritoService).listarFavoritos(eq("cliente@example.com"), argThat(pageable ->
                    pageable.getPageNumber() == 0 && pageable.getPageSize() == 12));
        }

        @Test
        @WithMockUser(username = "cliente@example.com", roles = "CUSTOMER")
        @DisplayName("GET /api/favoritos/ids retorna lista ligera de IDs")
        void listarIds_retorna200() throws Exception {
            when(favoritoService.listarIdsFavoritos("cliente@example.com"))
                    .thenReturn(List.of(100L, 105L));

            mockMvc.perform(get("/api/favoritos/ids"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0]").value(100))
                    .andExpect(jsonPath("$[1]").value(105));
        }
    }
}
