package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.pago.webpay.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos/webpay")
@RequiredArgsConstructor
@Tag(name = "Webpay Plus", description = "Integración con pasarela de pago Transbank Webpay Plus")
public class WebpayController {

    private final WebpayService service;

    @PostMapping("/iniciar")
    @Operation(summary = "Iniciar transacción Webpay",
            description = "Crea la transacción en Transbank. Devuelve token y url para redirigir al cliente")
    public ResponseEntity<DatosRespuestaIniciarWebpay> iniciar(
            Authentication authentication,
            @RequestBody @Valid DatosIniciarWebpay datos) {
        return ResponseEntity.ok(
                service.iniciar(authentication.getName(), datos));
    }

    // GET - retorno normal API 1.1+ (token_ws en query param)
    @GetMapping("/confirmar")
    @Operation(summary = "Confirmar transacción Webpay (GET)",
            description = "Transbank redirige aquí con token_ws o TBK_TOKEN según el resultado")
    public ResponseEntity<DatosRespuestaConfirmarWebpay> confirmarGet(
            @RequestParam(value = "token_ws", required = false) String tokenWs,
            @RequestParam(value = "TBK_TOKEN", required = false) String tbkToken) {
        return ResponseEntity.ok(service.confirmar(tokenWs, tbkToken));
    }

    // POST - compatibilidad y casos de abort en integración
    @PostMapping("/confirmar")
    @Operation(summary = "Confirmar transacción Webpay (POST)",
            description = "Alternativa POST para confirmar. Acepta token_ws en body")
    public ResponseEntity<DatosRespuestaConfirmarWebpay> confirmarPost(
            @RequestParam(value = "token_ws", required = false) String tokenWsParam,
            @RequestParam(value = "TBK_TOKEN", required = false) String tbkToken,
            @RequestBody(required = false) DatosConfirmarWebpay body) {
        // token_ws puede venir por query param o por body
        String tokenWs = tokenWsParam != null ? tokenWsParam
                : (body != null ? body.token_ws() : null);
        return ResponseEntity.ok(service.confirmar(tokenWs, tbkToken));
    }

    @GetMapping("/estado/{ordenId}")
    @Operation(summary = "Consultar estado de transacción",
            description = "Útil para polling del frontend mientras espera el retorno de Webpay")
    public ResponseEntity<DatosEstadoWebpay> estado(@PathVariable Long ordenId) {
        return ResponseEntity.ok(service.consultarEstado(ordenId));
    }

    // Webhook de Transbank - público, validado por secret
    @PostMapping("/webhook")
    @Operation(summary = "Webhook de Transbank",
            description = "Endpoint para notificaciones de Transbank en producción")
    public ResponseEntity<Void> webhook(
            @RequestParam(value = "token_ws", required = false) String tokenWs,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String secret) {
        // Validar que viene de Transbank
        // En producción comparar con api.webpay.webhook-secret
        if (tokenWs != null) {
            service.procesarWebhook(tokenWs);
        }
        return ResponseEntity.ok().build();
    }
}