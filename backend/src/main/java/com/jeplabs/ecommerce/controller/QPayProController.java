package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenRepository;
import com.jeplabs.ecommerce.domain.pago.qpaypro.QPayProService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos/qpaypro")
@RequiredArgsConstructor
public class QPayProController {

    private final QPayProService qpayproService;
    private final OrdenRepository ordenRepository;

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5173}")
    private String frontendUrlBase;

    public record DatosIniciarPagoQPayPro(Integer cuotas) {}

    @PostMapping("/{ordenId}/iniciar")
    public ResponseEntity<Map<String, String>> iniciarPago(@PathVariable Long ordenId, @RequestBody(required = false) DatosIniciarPagoQPayPro datos) {
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));

        Integer cuotas = (datos != null && datos.cuotas() != null) ? datos.cuotas() : 1;
        String urlPago = qpayproService.iniciarPago(orden, cuotas);

        return ResponseEntity.ok(Map.of("url", urlPago));
    }

    @GetMapping("/retorno")
    public ResponseEntity<String> retornoQPayPro(
            @RequestParam("x_response_status") String responseStatus,
            @RequestParam(value = "x_trans_id", required = false) String transId,
            @RequestParam(value = "x_amount", required = false) String amount,
            @RequestParam(value = "x_MD5_Hash", required = false) String md5Hash,
            @RequestParam("x_invoice_num") String invoiceNum) {

        qpayproService.confirmarPago(responseStatus, transId, amount, md5Hash, invoiceNum);
        
        // Redirigir al frontend a una pantalla de éxito o error
        String frontendUrl = frontendUrlBase + "/checkout/success?orden=" + invoiceNum;
        if (!"1".equals(responseStatus)) {
            frontendUrl = frontendUrlBase + "/checkout/error?orden=" + invoiceNum;
        }

        return ResponseEntity.status(302).header("Location", frontendUrl).build();
    }
}
