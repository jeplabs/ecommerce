package com.jeplabs.ecommerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.categoria.CategoriaService;
import com.jeplabs.ecommerce.domain.categoria.DatosCrearCategoria;
import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;
import com.jeplabs.ecommerce.infra.exceptions.CategoriaEnUsoException;
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

import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Tests de CategoriaController")
class CategoriaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    @MockitoBean
    private CategoriaService categoriaService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    private DatosRespuestaCategoria categoriaRespuesta;

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
                            .requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    @BeforeEach
    void setUp() {
        categoriaRespuesta = new DatosRespuestaCategoria(
                1L,
                "Computación",
                "computacion",
                null,
                List.of()
        );
    }

    @Nested
    @DisplayName("Endpoints públicos GET /api/categorias")
    class PublicoTests {

        @Test
        @DisplayName("HTTP 200 al listar árbol de categorías sin autenticación")
        void listar_sinToken_debeRetornar200() throws Exception {
            when(categoriaService.listar()).thenReturn(List.of(categoriaRespuesta));

            mockMvc.perform(get("/api/categorias"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].nombre").value("Computación"))
                    .andExpect(jsonPath("$[0].slug").value("computacion"));
        }

        @Test
        @DisplayName("HTTP 404 al consultar categoría inexistente por ID")
        void buscarPorId_inexistente_debeRetornar404() throws Exception {
            when(categoriaService.buscarPorId(999L))
                    .thenThrow(new NoSuchElementException("Categoría no encontrada con ID: 999"));

            mockMvc.perform(get("/api/categorias/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Categoría no encontrada con ID: 999"));
        }
    }

    @Nested
    @DisplayName("Endpoints administrativos /api/categorias")
    class AdminTests {

        @Test
        @DisplayName("HTTP 403 al intentar eliminar categoría con rol CUSTOMER")
        @WithMockUser(roles = "CUSTOMER")
        void eliminar_comoCustomer_debeRetornar403() throws Exception {
            mockMvc.perform(delete("/api/categorias/1").with(csrf()))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("HTTP 201 al crear categoría como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void crear_comoAdmin_debeRetornar201() throws Exception {
            when(categoriaService.crear(any())).thenReturn(categoriaRespuesta);

            mockMvc.perform(post("/api/categorias")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new DatosCrearCategoria("Computación", null)))
                            .with(csrf()))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.slug").value("computacion"));
        }

        @Test
        @DisplayName("HTTP 200 al actualizar categoría como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void actualizar_comoAdmin_debeRetornar200() throws Exception {
            when(categoriaService.actualizar(eq(1L), any())).thenReturn(categoriaRespuesta);

            mockMvc.perform(patch("/api/categorias/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new DatosCrearCategoria("Computación", null)))
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1));
        }

        @Test
        @DisplayName("HTTP 204 al eliminar categoría vacía como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void eliminar_comoAdmin_debeRetornar204() throws Exception {
            doNothing().when(categoriaService).eliminar(1L);

            mockMvc.perform(delete("/api/categorias/1").with(csrf()))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("HTTP 404 al eliminar categoría inexistente como ADMIN")
        @WithMockUser(roles = "ADMIN")
        void eliminar_inexistente_debeRetornar404() throws Exception {
            doThrow(new NoSuchElementException("Categoría no encontrada con ID: 999"))
                    .when(categoriaService).eliminar(999L);

            mockMvc.perform(delete("/api/categorias/999").with(csrf()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Categoría no encontrada con ID: 999"));
        }

        @Test
        @DisplayName("HTTP 409 con código CATEGORIA_CON_SUBCATEGORIAS cuando tiene hijas")
        @WithMockUser(roles = "ADMIN")
        void eliminar_conSubcategorias_debeRetornar409() throws Exception {
            doThrow(new CategoriaEnUsoException(
                    "No se puede eliminar la categoría «Computación» porque contiene 2 subcategorías. Muévelas o elimínalas primero.",
                    CategoriaEnUsoException.CODIGO_CON_SUBCATEGORIAS))
                    .when(categoriaService).eliminar(1L);

            mockMvc.perform(delete("/api/categorias/1").with(csrf()))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.codigo").value("CATEGORIA_CON_SUBCATEGORIAS"))
                    .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("2 subcategorías")));
        }

        @Test
        @DisplayName("HTTP 409 con código CATEGORIA_CON_PRODUCTOS cuando tiene productos")
        @WithMockUser(roles = "ADMIN")
        void eliminar_conProductos_debeRetornar409() throws Exception {
            doThrow(new CategoriaEnUsoException(
                    "No se puede eliminar la categoría «Laptops» porque tiene 4 productos asociados. Reasigna los productos antes de eliminar.",
                    CategoriaEnUsoException.CODIGO_CON_PRODUCTOS))
                    .when(categoriaService).eliminar(2L);

            mockMvc.perform(delete("/api/categorias/2").with(csrf()))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.codigo").value("CATEGORIA_CON_PRODUCTOS"))
                    .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("4 productos asociados")));
        }
    }
}
