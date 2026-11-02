package com.jeplabs.ecommerce.infra.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Tests de MonedaFormatter para Guatemala (GTQ) y Chile (CLP)")
class MonedaFormatterTest {

    private MonedaConfig crearConfig(String codigo, String simbolo, String nombre, String locale, int decimales) {
        MonedaConfig config = new MonedaConfig();
        ReflectionTestUtils.setField(config, "codigo", codigo);
        ReflectionTestUtils.setField(config, "simbolo", simbolo);
        ReflectionTestUtils.setField(config, "nombre", nombre);
        ReflectionTestUtils.setField(config, "locale", locale);
        ReflectionTestUtils.setField(config, "decimales", decimales);
        return config;
    }

    @Test
    @DisplayName("Formatea montos para Guatemala (GTQ) con símbolo Q y 2 decimales")
    void formatear_guatemala_retornaSimboloQYDosDecimales() {
        MonedaConfig gtConfig = crearConfig("GTQ", "Q", "Quetzal", "es-GT", 2);
        MonedaFormatter formatter = new MonedaFormatter(gtConfig);

        String resultado = formatter.formatear(new BigDecimal("1900.5"));
        assertTrue(resultado.startsWith("Q"));
        assertTrue(resultado.endsWith(".50") || resultado.endsWith(",50"));
        assertEquals("Q0", formatter.formatear(null));
    }

    @Test
    @DisplayName("Formatea montos para Chile (CLP) con símbolo $ y 0 decimales")
    void formatear_chile_retornaSimboloPesoYSinDecimales() {
        MonedaConfig clConfig = crearConfig("CLP", "$", "Peso Chileno", "es-CL", 0);
        MonedaFormatter formatter = new MonedaFormatter(clConfig);

        String resultado = formatter.formatear(new BigDecimal("19990.40"));
        assertTrue(resultado.startsWith("$"));
        assertTrue(resultado.contains("19") && resultado.contains("990"));
        assertEquals("$0", formatter.formatear(null));
    }
}
