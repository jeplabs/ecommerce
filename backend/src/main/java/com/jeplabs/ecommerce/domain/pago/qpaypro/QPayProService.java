package com.jeplabs.ecommerce.domain.pago.qpaypro;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.orden.EstadoOrden;
import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenItem;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QPayProService {

    private final QPayProTransaccionRepository qpayproRepository;
    private final OrdenRepository ordenRepository;
    private final OrdenService ordenService;
    private final RestTemplate restTemplate;

    // ObjectMapper es thread-safe para serialización. Se declara static final
    // para evitar romper contextos parciales de @WebMvcTest en otros controllers.
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${qpaypro.api.login}")
    private String apiLogin;

    @Value("${qpaypro.api.key}")
    private String apiKey;

    @Value("${qpaypro.api.url}")
    private String apiUrl;

    @Value("${qpaypro.api.store-url}")
    private String apiStoreUrl;

    @Value("${qpaypro.api.fel-url}")
    private String apiFelUrl;

    @Value("${api.base-url}")
    private String baseUrl;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrlBase;

    @Value("${qpaypro.api.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public String iniciarPago(Orden orden, Integer cuotas) {
        String currency = "GTQ";

        QPayProTransaccion transaccion = new QPayProTransaccion(orden, orden.getTotal(), cuotas);
        qpayproRepository.save(transaccion);

        // ── Sanitización estricta para CyberSource (Error #102) ──
        String firstName = orden.getUsuario() != null && orden.getUsuario().getNombre() != null
                && !orden.getUsuario().getNombre().isBlank()
                ? orden.getUsuario().getNombre() : "Cliente";

        String lastName = orden.getUsuario() != null && orden.getUsuario().getApellido() != null
                && !orden.getUsuario().getApellido().isBlank()
                ? orden.getUsuario().getApellido() : firstName;

        String email = orden.getUsuario() != null && orden.getUsuario().getEmail() != null
                && !orden.getUsuario().getEmail().isBlank()
                ? orden.getUsuario().getEmail() : "cliente@ejemplo.com";

        String phoneRaw = orden.getDireccionTelefono() != null
                ? orden.getDireccionTelefono().replaceAll("[^0-9]", "") : "";
        String phone = phoneRaw.length() >= 8 ? phoneRaw : "12345678";

        String address = orden.getDireccionCalle() != null && !orden.getDireccionCalle().isBlank()
                ? orden.getDireccionCalle() : "Ciudad de Guatemala";

        String city = orden.getDireccionCiudad() != null && !orden.getDireccionCiudad().isBlank()
                ? orden.getDireccionCiudad() : "Guatemala";

        String state = orden.getDireccionEstado() != null && !orden.getDireccionEstado().isBlank()
                ? orden.getDireccionEstado() : "Guatemala";

        // CyberSource exige código ISO de 2 letras en mayúsculas (ej. "GT")
        String countryRaw = orden.getDireccionPais();
        String country = countryRaw != null && countryRaw.trim().length() == 2
                ? countryRaw.trim().toUpperCase() : "GT";

        String zip = orden.getDireccionCodigoPostal() != null && !orden.getDireccionCodigoPostal().isBlank()
                ? orden.getDireccionCodigoPostal() : "01001";

        // ── Payload ──
        Map<String, Object> payload = new HashMap<>();
        payload.put("x_login", apiLogin);
        payload.put("x_api_key", apiKey);
        payload.put("x_amount", orden.getTotal().toString());
        payload.put("x_currency_code", currency);
        payload.put("x_first_name", firstName);
        payload.put("x_last_name", lastName);
        payload.put("x_email", email);
        payload.put("x_phone", phone);
        payload.put("x_address", address);
        payload.put("x_city", city);
        payload.put("x_state", state);
        payload.put("x_country", country);
        payload.put("x_zip", zip);

        payload.put("x_company", "C/F");
        payload.put("x_description", "Orden #" + orden.getId());
        payload.put("x_invoice_num", orden.getId().toString());
        payload.put("x_freight", orden.getCostoEnvio() != null ? orden.getCostoEnvio().toString() : "0.00");

        // Impuestos forzados a "0.00" porque precioUnitario ya incluye IVA.
        // Enviar el IVA aparte causa un descuadre que produce 502 Bad Gateway en QPayPro.
        payload.put("taxes", "0.00");
        payload.put("x_tax", "0.00");

        payload.put("x_type", "AUTH_ONLY");
        payload.put("x_method", "CC");
        payload.put("origen", "PLUGIN");
        payload.put("http_origin", frontendUrlBase);
        payload.put("store_type", "hostedpage");

        // Cuotas dinámicas
        if (cuotas != null && cuotas > 1) {
            payload.put("x_visacuotas", "si");
            payload.put("x_cuota", cuotas.toString());
        } else {
            payload.put("x_visacuotas", "no");
        }

        // ── Matriz de productos (formato posicional QPayPro) ──
        // Estructura: [["Nombre", "Precio", "SKU", "Cantidad", "TaxFlag", "TotalFlag"]]
        List<List<String>> productsList = new ArrayList<>();
        if (orden.getItems() != null && !orden.getItems().isEmpty()) {
            for (OrdenItem item : orden.getItems()) {
                String nombre = item.getNombreProducto() != null ? item.getNombreProducto() : "Producto";
                String precio = String.format(Locale.US, "%.2f",
                        item.getPrecioUnitario() != null ? item.getPrecioUnitario() : BigDecimal.ZERO);
                String sku = item.getSku() != null ? item.getSku() : "";
                String cantidad = String.valueOf(item.getCantidad() != null ? item.getCantidad() : 1);

                List<String> prod = new ArrayList<>();
                prod.add(nombre);
                prod.add(precio);
                prod.add(sku);
                prod.add(cantidad);
                prod.add("0"); // Tax Flag
                prod.add("1"); // Line Total Flag
                productsList.add(prod);
            }
        } else {
            List<String> prod = new ArrayList<>();
            prod.add("Orden #" + orden.getId());
            prod.add(orden.getTotal().toString());
            prod.add("");
            prod.add("1");
            prod.add("0");
            prod.add("1");
            productsList.add(prod);
        }

        try {
            String productsJson = objectMapper.writeValueAsString(productsList);
            payload.put("products", productsJson);
        } catch (Exception e) {
            log.error("Error serializando lista de productos para QPayPro", e);
            payload.put("products", "[]");
        }

        // URLs de retorno
        payload.put("x_relay_url", baseUrl + "/api/pagos/qpaypro/retorno");
        payload.put("x_url_cancel", baseUrl + "/checkout");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl + "/register_transaction_store", request, Map.class);
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
        } catch (org.springframework.web.client.RestClientResponseException e) {
            log.error("Error HTTP devuelto por QPayPro ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Fallo de comunicación con la pasarela de pagos. Contacte a soporte.");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Excepción llamando a QPayPro", e);
            throw new RuntimeException("No se pudo iniciar el pago");
        }
    }

    @Transactional
    public Orden confirmarPago(String responseStatus, String transId, String amount,
                               String md5Hash, String invoiceNum) {
        QPayProTransaccion transaccion = null;

        // Intento primario: buscar por el ID de la orden que enviamos como x_invoice_num
        try {
            Long ordenId = Long.parseLong(invoiceNum);
            transaccion = qpayproRepository.findByOrdenIdAndEstado(ordenId, EstadoQPayPro.PENDIENTE)
                    .orElse(null);
        } catch (NumberFormatException e) {
            log.warn("El invoiceNum '{}' no es un número válido, activando fallback", invoiceNum);
        }

        // Fallback: el Sandbox de QPayPro sobreescribe x_invoice_num con un ID de pruebas.
        // Buscamos la última transacción PENDIENTE que coincida con el monto exacto
        // para mitigar race conditions entre clientes concurrentes.
        if (transaccion == null) {
            log.warn("No se encontró transacción por invoiceNum={}. Buscando por estado PENDIENTE y monto {}",
                    invoiceNum, amount);
            BigDecimal montoCallback = new BigDecimal(amount);
            transaccion = qpayproRepository
                    .findFirstByEstadoAndMontoOrderByCreadoAtDesc(EstadoQPayPro.PENDIENTE, montoCallback)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No hay transacción pendiente que coincida con este monto"));
        }

        Orden orden = transaccion.getOrden();
        boolean isAprobado = "1".equals(responseStatus);

        if (isAprobado) {
            transaccion.marcarComoAprobada(transId, md5Hash);
            orden.cambiarEstado(EstadoOrden.CONFIRMADA);
            ordenRepository.save(orden);
            emitirFacturaFel(transaccion, orden);
        } else {
            transaccion.marcarComoDenegada(md5Hash);
            orden.cancelar();
            ordenService.expiracionAutomatica(orden.getId());
        }

        return orden;
    }

    @Transactional
    public void emitirFacturaFel(QPayProTransaccion transaccion, Orden orden) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("public_key", apiLogin);
        payload.put("Transaccion", transaccion.getTransactionId());

        // Buscamos NIT en notas si existe, o dejamos CF
        String nit = orden.getNotas() != null && orden.getNotas().contains("NIT:")
                ? orden.getNotas().substring(orden.getNotas().indexOf("NIT:") + 4).split(" ")[0].trim()
                : "CF";

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
            if (response != null && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if ("success".equals(body.get("estado")) || body.containsKey("fel_uuid")) {
                    String felUuid = (String) body.get("fel_uuid");
                    String felSerie = (String) body.get("fel_serie");
                    String felNumero = (String) body.get("fel_numero");
                    transaccion.guardarDatosFel(felUuid, felSerie, felNumero);
                }
            }
        } catch (Exception e) {
            log.error("Fallo al emitir factura FEL para la orden {}", orden.getId(), e);
            // No bloqueamos la transacción por fallo de FEL
        }
    }
}
