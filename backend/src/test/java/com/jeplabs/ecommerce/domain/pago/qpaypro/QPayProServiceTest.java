package com.jeplabs.ecommerce.domain.pago.qpaypro;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeplabs.ecommerce.domain.orden.EstadoOrden;
import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenItem;
import com.jeplabs.ecommerce.domain.orden.OrdenRepository;
import com.jeplabs.ecommerce.domain.orden.OrdenService;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QPayProServiceTest {

    @Mock
    private QPayProTransaccionRepository qpayproRepository;

    @Mock
    private OrdenRepository ordenRepository;

    @Mock
    private OrdenService ordenService;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private QPayProService qpayProService;

    private Orden ordenMock;
    private QPayProTransaccion transaccionMock;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(qpayProService, "apiLogin", "testLogin");
        ReflectionTestUtils.setField(qpayProService, "apiKey", "testKey");
        ReflectionTestUtils.setField(qpayProService, "apiUrl", "http://mock/checkout");
        ReflectionTestUtils.setField(qpayProService, "apiStoreUrl", "http://mock/checkout/store?token=");
        ReflectionTestUtils.setField(qpayProService, "apiFelUrl", "http://mock/checkout/qpayfel/facturar");
        ReflectionTestUtils.setField(qpayProService, "baseUrl", "http://localhost:8080");
        ReflectionTestUtils.setField(qpayProService, "frontendUrlBase", "http://localhost:5173");
        ReflectionTestUtils.setField(qpayProService, "webhookSecret", "TEST_SECRET");

        Usuario usuario = mock(Usuario.class);
        lenient().when(usuario.getNombre()).thenReturn("Marlon");
        lenient().when(usuario.getApellido()).thenReturn("Pérez");
        lenient().when(usuario.getEmail()).thenReturn("test@test.com");

        ordenMock = mock(Orden.class);
        lenient().when(ordenMock.getId()).thenReturn(1L);
        lenient().when(ordenMock.getTotal()).thenReturn(new BigDecimal("100.00"));
        lenient().when(ordenMock.getUsuario()).thenReturn(usuario);
        lenient().when(ordenMock.getDireccionTelefono()).thenReturn("12345678");

        transaccionMock = new QPayProTransaccion(ordenMock, new BigDecimal("100.00"), 1);
    }

    @Test
    void iniciarPago_DebeRetornarUrlConToken_CuandoQPayProRespondeExito() {
        // Arrange
        Map<String, Object> data = new HashMap<>();
        data.put("token", "token123");
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("estado", "success");
        responseBody.put("data", data);

        ResponseEntity<Map> responseEntity = ResponseEntity.ok(responseBody);

        when(restTemplate.postForEntity(
                eq("http://mock/checkout/register_transaction_store"),
                any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        // Act
        String urlRetornada = qpayProService.iniciarPago(ordenMock, 1);

        // Assert
        assertEquals("http://mock/checkout/store?token=token123", urlRetornada);
        verify(qpayproRepository, times(1)).save(any(QPayProTransaccion.class));
    }

    @Test
    void iniciarPago_DebeLanzarExcepcion_CuandoQPayProFalla() {
        // Arrange
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("estado", "error");
        ResponseEntity<Map> responseEntity = ResponseEntity.ok(responseBody);

        when(restTemplate.postForEntity(
                eq("http://mock/checkout/register_transaction_store"),
                any(HttpEntity.class), eq(Map.class)))
                .thenReturn(responseEntity);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class,
                () -> qpayProService.iniciarPago(ordenMock, 1));
        assertEquals("Error en QPayPro al registrar transacción", exception.getMessage());
    }

    @Test
    void confirmarPago_DebeAprobarOrdenYFacturar_CuandoEstadoEs1() {
        // Arrange
        when(qpayproRepository.findByOrdenIdAndEstado(1L, EstadoQPayPro.PENDIENTE))
                .thenReturn(Optional.of(transaccionMock));

        ResponseEntity<Map> felResponse = new ResponseEntity<>(
                Map.of("estado", "success", "fel_uuid", "FEL-1234"), HttpStatus.OK);
        when(restTemplate.postForEntity(
                eq("http://mock/checkout/qpayfel/facturar"),
                any(HttpEntity.class), eq(Map.class)))
                .thenReturn(felResponse);

        // Act
        Orden ordenRetornada = qpayProService.confirmarPago("1", "T999", "100.00", "HASH123", "1");

        // Assert
        assertEquals(EstadoQPayPro.APROBADA, transaccionMock.getEstado());
        assertEquals("T999", transaccionMock.getTransactionId());
        verify(ordenMock, times(1)).cambiarEstado(EstadoOrden.CONFIRMADA);
        verify(ordenRepository, times(1)).save(ordenMock);
        verify(restTemplate, times(1)).postForEntity(
                eq("http://mock/checkout/qpayfel/facturar"),
                any(HttpEntity.class), eq(Map.class));
        assertNotNull(ordenRetornada);
    }

    @Test
    void confirmarPago_DebeDenegarYCancelarOrden_CuandoEstadoNoEs1() {
        // Arrange
        when(qpayproRepository.findByOrdenIdAndEstado(1L, EstadoQPayPro.PENDIENTE))
                .thenReturn(Optional.of(transaccionMock));

        // Act
        Orden ordenRetornada = qpayProService.confirmarPago("2", "T999", "100.00", "HASH123", "1");

        // Assert
        assertEquals(EstadoQPayPro.DENEGADA, transaccionMock.getEstado());
        verify(ordenMock, times(1)).cancelar();
        verify(ordenService, times(1)).expiracionAutomatica(1L);
        assertNotNull(ordenRetornada);
    }

    @Test
    void iniciarPago_DebeEnviarMatrizProductosConFormatoOficialQPayPro() throws Exception {
        // Arrange
        OrdenItem itemMock = mock(OrdenItem.class);
        when(itemMock.getNombreProducto()).thenReturn("Zapatos Running");
        when(itemMock.getSku()).thenReturn("ZAP-001");
        when(itemMock.getCantidad()).thenReturn(2);
        when(itemMock.getPrecioUnitario()).thenReturn(new BigDecimal("150.00"));

        when(ordenMock.getItems()).thenReturn(List.of(itemMock));
        when(ordenMock.getTotal()).thenReturn(new BigDecimal("335.00"));
        when(ordenMock.getCostoEnvio()).thenReturn(new BigDecimal("35.00"));

        Map<String, Object> data = Map.of("token", "tok_test_456");
        Map<String, Object> responseBody = Map.of("estado", "success", "data", data);
        ResponseEntity<Map> responseEntity = ResponseEntity.ok(responseBody);

        org.mockito.ArgumentCaptor<HttpEntity> requestCaptor = org.mockito.ArgumentCaptor.forClass(HttpEntity.class);
        when(restTemplate.postForEntity(anyString(), requestCaptor.capture(), eq(Map.class)))
                .thenReturn(responseEntity);

        // Act
        String url = qpayProService.iniciarPago(ordenMock, 1);

        // Assert
        assertEquals("http://mock/checkout/store?token=tok_test_456", url);
        Map<String, Object> sentPayload = (Map<String, Object>) requestCaptor.getValue().getBody();
        assertNotNull(sentPayload);
        assertEquals("335.00", sentPayload.get("x_amount"));
        assertEquals("35.00", sentPayload.get("x_freight"));
        assertEquals("0.00", sentPayload.get("x_tax"));

        String productsJson = (String) sentPayload.get("products");
        assertNotNull(productsJson);
        // Deserializar para verificar posiciones: [description, SKU, url_product, quantity, Price, total_product]
        List<List<String>> matrix = new ObjectMapper().readValue(productsJson, List.class);
        assertEquals(1, matrix.size());
        List<String> prod0 = matrix.get(0);
        assertEquals("Zapatos Running", prod0.get(0)); // 0: description
        assertEquals("ZAP-001", prod0.get(1));         // 1: SKU
        assertEquals("", prod0.get(2));                // 2: url_product
        assertEquals("2", prod0.get(3));               // 3: quantity
        assertEquals("150.00", prod0.get(4));          // 4: Price
        assertEquals("300.00", prod0.get(5));          // 5: total_product
    }
}
