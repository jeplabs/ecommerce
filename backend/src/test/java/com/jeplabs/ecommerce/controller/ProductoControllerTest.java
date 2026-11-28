package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.categoria.DatosRespuestaCategoria;
import com.jeplabs.ecommerce.domain.producto.*;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
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
import java.util.Map;

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
@DisplayName("Tests de ProductoController")
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoService productoService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    private DatosRespuestaProductoAdmin productoAdminRespuesta;

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
                            .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
                            .anyRequest().authenticated()
                    )
                    .build();
        }
    }

    @BeforeEach
    void setUp() {
        productoAdminRespuesta = new DatosRespuestaProductoAdmin(
                1L,
                "SKU-LAP-001",
                "Laptop Pro 16",
                "laptop-pro-16",
                "Descripción completa del producto oculto",
                Map.of("ram", "32GB"),
                5,
                EstadoProducto.OCULTO,
                new BigDecimal("1500.00"),
                new BigDecimal("1000.00"),
                new BigDecimal("33.33"),
                "GTQ",
                List.of(new DatosRespuestaImagen(10L, "https://cdn.example.com/laptop.jpg", true)),
                List.of(new DatosRespuestaCategoria(2L, "Laptops", "laptops", null, List.of())),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("GET /api/productos/admin")
    class ListarAdminTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ADMIN puede listar y filtrar por nombre o SKU")
        void listarAdmin_comoAdmin_retorna200ConCamposCompletos() throws Exception {
            when(productoService.listarAdmin(eq("SKU-LAP"), eq(null), eq(null), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(productoAdminRespuesta), PageRequest.of(0, 10), 1));

            mockMvc.perform(get("/api/productos/admin").param("nombre", "SKU-LAP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].sku").value("SKU-LAP-001"))
                    .andExpect(jsonPath("$.content[0].descripcion").value("Descripción completa del producto oculto"))
                    .andExpect(jsonPath("$.content[0].specs.ram").value("32GB"))
                    .andExpect(jsonPath("$.content[0].categorias[0].nombre").value("Laptops"));
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ADMIN puede ordenar por precioVenta descendente")
        void listarAdmin_conSortPrecioVentaDesc_pasaPageableConSort() throws Exception {
            when(productoService.listarAdmin(eq(null), eq(null), eq(null), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(productoAdminRespuesta), PageRequest.of(0, 10), 1));

            mockMvc.perform(get("/api/productos/admin")
                            .param("sort", "precioVenta,desc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(1));

            verify(productoService).listarAdmin(eq(null), eq(null), eq(null), argThat(pageable ->
                    pageable.getSort().getOrderFor("precioVenta") != null
                            && pageable.getSort().getOrderFor("precioVenta").isDescending()));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("CUSTOMER recibe 403 en GET /api/productos/admin")
        void listarAdmin_comoCustomer_retorna403() throws Exception {
            mockMvc.perform(get("/api/productos/admin"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/productos")
    class ListarPublicoTests {

        @Test
        @DisplayName("Propaga sort=precioVenta,asc y paginación al servicio de catálogo")
        void listarPublico_conSortYCategoria_pasaPageableConSort() throws Exception {
            DatosRespuestaCatalogoPage page = new DatosRespuestaCatalogoPage(
                    List.of(), 1, 12, 0, 0, false, true, Map.of());
            when(productoService.listarFacetado(eq(null), eq(5L), eq(null), eq(null), any(), any(Pageable.class)))
                    .thenReturn(page);

            mockMvc.perform(get("/api/productos")
                            .param("categoriaId", "5")
                            .param("page", "1")
                            .param("size", "12")
                            .param("sort", "precioVenta,asc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.number").value(1))
                    .andExpect(jsonPath("$.size").value(12));

            verify(productoService).listarFacetado(eq(null), eq(5L), eq(null), eq(null), any(), argThat(pageable ->
                    pageable.getPageNumber() == 1
                            && pageable.getPageSize() == 12
                            && pageable.getSort().getOrderFor("precioVenta") != null
                            && pageable.getSort().getOrderFor("precioVenta").isAscending()));
        }

        @Test
        @DisplayName("GET /api/productos?search=... sin sort propaga Pageable sin orden para activar relevancia")
        void listarPublico_conSearchSinSort_pasaPageableSinOrden() throws Exception {
            DatosRespuestaCatalogoPage page = new DatosRespuestaCatalogoPage(
                    List.of(), 0, 12, 0, 0, true, true, Map.of());
            when(productoService.listarFacetado(eq("laptop asus"), eq(null), eq(null), eq(null), any(), any(Pageable.class)))
                    .thenReturn(page);

            mockMvc.perform(get("/api/productos").param("search", "laptop asus"))
                    .andExpect(status().isOk());

            verify(productoService).listarFacetado(eq("laptop asus"), eq(null), eq(null), eq(null), any(),
                    argThat(pageable -> pageable.getSort().isUnsorted() && pageable.getPageSize() == 12));
        }
    }

    @Nested
    @DisplayName("GET /api/productos/admin/{id}")
    class BuscarAdminPorIdTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ADMIN obtiene descripcion, specs y categorias de producto oculto")
        void buscarAdminPorId_comoAdmin_retorna200() throws Exception {
            when(productoService.buscarAdminPorId(1L)).thenReturn(productoAdminRespuesta);

            mockMvc.perform(get("/api/productos/admin/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.estado").value("OCULTO"))
                    .andExpect(jsonPath("$.descripcion").value("Descripción completa del producto oculto"))
                    .andExpect(jsonPath("$.specs.ram").value("32GB"))
                    .andExpect(jsonPath("$.categorias[0].id").value(2));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("CUSTOMER recibe 403 en GET /api/productos/admin/{id}")
        void buscarAdminPorId_comoCustomer_retorna403() throws Exception {
            mockMvc.perform(get("/api/productos/admin/1"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("GET /api/productos/admin/{id}/imagenes")
    class ListarImagenesAdminTests {

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("ADMIN obtiene imágenes de producto oculto")
        void listarImagenesAdmin_comoAdmin_retorna200() throws Exception {
            when(productoService.listarImagenesAdmin(1L))
                    .thenReturn(List.of(new DatosRespuestaImagen(10L, "https://cdn.example.com/laptop.jpg", true)));

            mockMvc.perform(get("/api/productos/admin/1/imagenes"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(10))
                    .andExpect(jsonPath("$[0].url").value("https://cdn.example.com/laptop.jpg"))
                    .andExpect(jsonPath("$[0].principal").value(true));
        }

        @Test
        @WithMockUser(roles = "CUSTOMER")
        @DisplayName("CUSTOMER recibe 403 en GET /api/productos/admin/{id}/imagenes")
        void listarImagenesAdmin_comoCustomer_retorna403() throws Exception {
            mockMvc.perform(get("/api/productos/admin/1/imagenes"))
                    .andExpect(status().isForbidden());
        }
    }
}
