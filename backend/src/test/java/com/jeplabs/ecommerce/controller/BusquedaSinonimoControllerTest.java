package com.jeplabs.ecommerce.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.producto.BusquedaSinonimoService;
import com.jeplabs.ecommerce.domain.producto.DatosActualizarBusquedaSinonimo;
import com.jeplabs.ecommerce.domain.producto.DatosCrearBusquedaSinonimo;
import com.jeplabs.ecommerce.domain.producto.DatosRespuestaBusquedaSinonimo;
import com.jeplabs.ecommerce.infra.security.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

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
@DisplayName("Tests de BusquedaSinonimoController")
class BusquedaSinonimoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @MockitoBean
    private BusquedaSinonimoService sinonimoService;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UsuarioDetailsService usuarioDetailsService;

    @MockitoBean
    private JwtAuthenticationEntryPoint authenticationEntryPoint;

    @MockitoBean
    private JwtAccessDeniedHandler accessDeniedHandler;

    private DatosRespuestaBusquedaSinonimo respuesta;

    @BeforeEach
    void setUp() {
        LocalDateTime now = LocalDateTime.now();
        respuesta = new DatosRespuestaBusquedaSinonimo(
                1L, "laptops", List.of("laptop", "notebook", "portatil"), true, now, now
        );
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    @DisplayName("CUSTOMER recibe 403 en GET /api/admin/busqueda/sinonimos")
    void listar_comoCustomer_retorna403() throws Exception {
        mockMvc.perform(get("/api/admin/busqueda/sinonimos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN lista grupos de sinónimos con 200")
    void listar_comoAdmin_retorna200() throws Exception {
        when(sinonimoService.listarTodos()).thenReturn(List.of(respuesta));

        mockMvc.perform(get("/api/admin/busqueda/sinonimos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombreGrupo").value("laptops"))
                .andExpect(jsonPath("$[0].terminos[1]").value("notebook"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN crea grupo de sinónimos con 201")
    void crear_comoAdmin_retorna201() throws Exception {
        when(sinonimoService.crear(any())).thenReturn(respuesta);

        DatosCrearBusquedaSinonimo dto = new DatosCrearBusquedaSinonimo(
                "laptops", List.of("laptop", "notebook"), true);

        mockMvc.perform(post("/api/admin/busqueda/sinonimos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN actualiza grupo con 200 y alterna estado con 200")
    void actualizarYToggle_comoAdmin_retorna200() throws Exception {
        when(sinonimoService.actualizar(eq(1L), any())).thenReturn(respuesta);
        when(sinonimoService.toggleActivo(1L)).thenReturn(respuesta);

        DatosActualizarBusquedaSinonimo dto = new DatosActualizarBusquedaSinonimo(
                "laptops", List.of("laptop", "notebook", "portatil"), true);

        mockMvc.perform(put("/api/admin/busqueda/sinonimos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(csrf()))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/admin/busqueda/sinonimos/1/estado").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN elimina grupo con 204 y recibe 404 cuando no existe")
    void eliminar_y404_comoAdmin() throws Exception {
        doNothing().when(sinonimoService).eliminar(1L);
        when(sinonimoService.buscarPorId(99L))
                .thenThrow(new NoSuchElementException("Grupo de sinónimos no encontrado con ID: 99"));

        mockMvc.perform(delete("/api/admin/busqueda/sinonimos/1").with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/admin/busqueda/sinonimos/99"))
                .andExpect(status().isNotFound());
    }
}
