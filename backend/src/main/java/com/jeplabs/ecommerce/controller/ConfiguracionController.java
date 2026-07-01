package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.infra.config.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
@Tag(name = "Configuración", description = "Configuración global de la aplicación")
public class ConfiguracionController {

    private final MonedaConfig monedaConfig;

    @Value("${api.envio.monto-minimo-gratis}")
    private BigDecimal montoMinimoEnvioGratis;

    @Value("${api.storage.provider}")
    private String storageProvider;

    @GetMapping
    @Operation(summary = "Obtener configuración global",
            description = "Público. El frontend lo consulta al iniciar para obtener moneda, límites y configuraciones")
    public ResponseEntity<ConfiguracionGlobal> obtenerConfiguracion() {
        return ResponseEntity.ok(new ConfiguracionGlobal(
                new DatosRespuestaMoneda(
                        monedaConfig.getCodigo(),
                        monedaConfig.getSimbolo(),
                        monedaConfig.getNombre(),
                        monedaConfig.getLocale(),
                        monedaConfig.getDecimales()
                ),
                montoMinimoEnvioGratis,
                storageProvider
        ));
    }
}
