package com.jeplabs.ecommerce.controller;

import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenRepository;
import com.jeplabs.ecommerce.domain.pago.qpaypro.QPayProService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/pagos/qpaypro")
@RequiredArgsConstructor
public class QPayProController {

    private final QPayProService qpayproService;
    private final OrdenRepository ordenRepository;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrlBase;

    public record DatosIniciarPagoQPayPro(Integer cuotas) {}

    @PostMapping("/{ordenId}/iniciar")
    public ResponseEntity<Map<String, String>> iniciarPago(
            @PathVariable Long ordenId,
            @RequestBody(required = false) DatosIniciarPagoQPayPro datos) {
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));

        Integer cuotas = (datos != null && datos.cuotas() != null) ? datos.cuotas() : 1;
        String urlPago = qpayproService.iniciarPago(orden, cuotas);

        return ResponseEntity.ok(Map.of("url", urlPago));
    }

    @RequestMapping(value = "/retorno", method = {RequestMethod.GET, RequestMethod.POST})
    public RedirectView retornoQPayPro(
            @RequestParam("x_response_status") String responseStatus,
            @RequestParam(value = "x_trans_id", required = false) String transId,
            @RequestParam(value = "x_amount", required = false) String amount,
            @RequestParam(value = "x_MD5_Hash", required = false) String md5Hash,
            @RequestParam("x_invoice_num") String invoiceNum) {

        Long ordenIdReal = null;
        try {
            Orden ordenConfirmada = qpayproService.confirmarPago(
                    responseStatus, transId, amount, md5Hash, invoiceNum);
            ordenIdReal = ordenConfirmada.getId();
        } catch (Exception e) {
            log.error("Error al procesar/confirmar el pago QPayPro para invoiceNum={}", invoiceNum, e);
        }

        String ordenParam = ordenIdReal != null ? ordenIdReal.toString() : invoiceNum;
        String statusParam = "1".equals(responseStatus) ? "success" : "failure";
        String targetUrl = frontendUrlBase + "/checkout/qpaypro/retorno?orden=" + ordenParam + "&status=" + statusParam;
        log.info("Redirigiendo navegador del cliente a Frontend: {}", targetUrl);

        return new RedirectView(targetUrl);
    }
}
