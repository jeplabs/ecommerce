package com.jeplabs.ecommerce.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Tests de ConfiguracionController")
class ConfiguracionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/config es público y devuelve la configuración de moneda, país e IVA activa")
    void obtenerConfiguracion_publico_retorna200ConMonedaYPais() throws Exception {
        mockMvc.perform(get("/api/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.moneda.codigo").value("GTQ"))
                .andExpect(jsonPath("$.moneda.simbolo").value("Q"))
                .andExpect(jsonPath("$.moneda.nombre").value("Quetzal"))
                .andExpect(jsonPath("$.moneda.locale").value("es-GT"))
                .andExpect(jsonPath("$.moneda.decimales").value(2))
                .andExpect(jsonPath("$.montoMinimoEnvioGratis").value(500.00))
                .andExpect(jsonPath("$.storageProvider").value("local"))
                .andExpect(jsonPath("$.paisCodigo").value("GT"))
                .andExpect(jsonPath("$.paisNombre").value("Guatemala"))
                .andExpect(jsonPath("$.porcentajeIva").value(0.12));
    }
}
