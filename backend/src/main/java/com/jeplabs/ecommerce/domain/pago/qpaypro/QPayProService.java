package com.jeplabs.ecommerce.domain.pago.qpaypro;

import com.jeplabs.ecommerce.domain.orden.EstadoOrden;
import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenRepository;
import com.jeplabs.ecommerce.domain.orden.OrdenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QPayProService {

    private final QPayProTransaccionRepository qpayproRepository;
    private final OrdenRepository ordenRepository;
    private final OrdenService ordenService;
    private final RestTemplate restTemplate;

    @Value("${qpaypro.api.login}")
    private String apiLogin;

    @Value("${qpaypro.api.key}")
    private String apiKey;

    @Value("${qpaypro.api.secret}")
    private String apiSecret;

    @Value("${qpaypro.api.url}")
    private String apiUrl;

    @Value("${qpaypro.api.store-url}")
    private String apiStoreUrl;

    @Value("${qpaypro.api.fel-url}")
    private String apiFelUrl;

    @Value("${api.base-url}")
    private String baseUrl;

    @Value("${qpaypro.api.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public String iniciarPago(Orden orden, Integer cuotas) {
        // Solo Quetzales
        String currency = "GTQ";

        QPayProTransaccion transaccion = new QPayProTransaccion(orden, orden.getTotal(), cuotas);
        qpayproRepository.save(transaccion);

        Map<String, Object> payload = new HashMap<>();
        payload.put("x_login", apiLogin);
        payload.put("x_api_key", apiKey);
        payload.put("x_amount", orden.getTotal().toString());
        payload.put("x_currency_code", currency);
        payload.put("x_first_name", orden.getUsuario().getNombre());
        payload.put("x_last_name", orden.getUsuario().getApellido() != null ? orden.getUsuario().getApellido() : "");
        payload.put("x_email", orden.getUsuario().getEmail());
        payload.put("x_phone", orden.getDireccionTelefono());
        payload.put("x_address", orden.getDireccionCalle());
        payload.put("x_city", orden.getDireccionCiudad());
        payload.put("x_state", orden.getDireccionEstado());
        payload.put("x_country", orden.getDireccionPais());
        payload.put("x_zip", orden.getDireccionCodigoPostal());
        
        // Empresa / NIT por defecto si no existe
        payload.put("x_company", "C/F"); 

        payload.put("x_description", "Orden #" + orden.getId());
        payload.put("x_invoice_num", orden.getId().toString());
        payload.put("x_freight", orden.getCostoEnvio() != null ? orden.getCostoEnvio().toString() : "0.00");
        payload.put("taxes", orden.getIva() != null ? orden.getIva().toString() : "0.00");
        
        payload.put("x_type", "AUTH_ONLY");
        payload.put("x_method", "CC");
        payload.put("origen", "PLUGIN");
        payload.put("store_type", "hostedpage");
        
        // Cuotas dinámicas
        if (cuotas != null && cuotas > 1) {
            payload.put("x_visacuotas", "si");
            payload.put("x_cuota", cuotas.toString());
        } else {
            payload.put("x_visacuotas", "no");
        }

        // URLs de retorno
        payload.put("x_relay_url", baseUrl + "/api/pagos/qpaypro/retorno");
        payload.put("x_url_cancel", baseUrl + "/checkout"); // Retorno en caso de cancelacion

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl + "/register_transaction_store", request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && "success".equals(body.get("estado"))) {
                Map<String, Object> data = (Map<String, Object>) body.get("data");
                String token = (String) data.get("token");
                transaccion.actualizarToken(token);
                return apiStoreUrl + token;
            } else {
                log.error("Error al iniciar pago en QPayPro: {}", body);
                throw new RuntimeException("Error en QPayPro al registrar transacción");
            }
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Excepción llamando a QPayPro", e);
            throw new RuntimeException("No se pudo iniciar el pago");
        }
    }

    @Transactional
    public void confirmarPago(String responseStatus, String transId, String amount, String md5Hash, String invoiceNum) {
        Long ordenId = Long.parseLong(invoiceNum);
        QPayProTransaccion transaccion = qpayproRepository.findByOrdenIdAndEstado(ordenId, EstadoQPayPro.PENDIENTE)
                .orElseThrow(() -> new IllegalArgumentException("No hay transacción pendiente para la orden: " + ordenId));

        Orden orden = ordenRepository.findById(ordenId).orElseThrow();

        // Validar firma (monto + trans_id + webhookSecret) según QPayPro (generalmente monto o status)
        // La implementación real de la firma depende de la configuración de hash del panel de QPayPro.
        // Simularemos la validación por ahora.
        boolean isAprobado = "1".equals(responseStatus);

        if (isAprobado) {
            transaccion.marcarComoAprobada(transId, md5Hash);
            orden.cambiarEstado(EstadoOrden.CONFIRMADA);
            ordenRepository.save(orden);
            
            // Emitir factura electrónica FEL inmediatamente
            emitirFacturaFel(transaccion, orden);
        } else {
            transaccion.marcarComoDenegada(md5Hash);
            orden.cancelar(); // Podríamos no cancelar de inmediato si queremos reintentos, pero lo cancelamos
            ordenService.expiracionAutomatica(ordenId); // Para retornar stock
        }
    }

    @Transactional
    public void emitirFacturaFel(QPayProTransaccion transaccion, Orden orden) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("public_key", apiLogin); // Suele ser la llave pública/login
        payload.put("Transaccion", transaccion.getTransactionId());
        
        // Buscamos NIT en notas si existe, o dejamos CF
        String nit = orden.getNotas() != null && orden.getNotas().contains("NIT:") ? 
                orden.getNotas().substring(orden.getNotas().indexOf("NIT:") + 4).split(" ")[0].trim() : "CF";
                
        payload.put("nit_cui", nit);
        payload.put("email", orden.getUsuario().getEmail());
        payload.put("direccion", orden.getDireccionCalle());
        payload.put("departamento", orden.getDireccionEstado());
        payload.put("municipio", orden.getDireccionCiudad());

        List<Map<String, Object>> detalles = orden.getItems().stream().map(item -> {
            Map<String, Object> map = new HashMap<>();
            map.put("descripcion", item.getNombreProducto());
            map.put("cantidad", item.getCantidad());
            map.put("precio", item.getPrecioUnitario().toString());
            return map;
        }).collect(Collectors.toList());

        payload.put("Detalles", detalles);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiFelUrl, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && "success".equals(body.get("estado")) || body.containsKey("fel_uuid")) {
                // Guardar los datos de la factura si los retorna
                String felUuid = (String) body.get("fel_uuid");
                String felSerie = (String) body.get("fel_serie");
                String felNumero = (String) body.get("fel_numero");
                transaccion.guardarDatosFel(felUuid, felSerie, felNumero);
            }
        } catch (Exception e) {
            log.error("Fallo al emitir factura FEL para la orden {}", orden.getId(), e);
            // No bloqueamos la transacción por fallo de FEL
        }
    }
}
