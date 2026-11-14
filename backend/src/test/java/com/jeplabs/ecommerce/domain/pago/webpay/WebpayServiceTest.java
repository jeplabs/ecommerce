package com.jeplabs.ecommerce.domain.pago.webpay;

import cl.transbank.webpay.webpayplus.WebpayPlus;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCommitResponse;
import cl.transbank.webpay.webpayplus.responses.WebpayPlusTransactionCreateResponse;
import com.jeplabs.ecommerce.domain.orden.EstadoOrden;
import com.jeplabs.ecommerce.domain.orden.Orden;
import com.jeplabs.ecommerce.domain.orden.OrdenRepository;
import com.jeplabs.ecommerce.domain.usuario.Usuario;
import com.jeplabs.ecommerce.domain.usuario.UsuarioRepository;
import com.jeplabs.ecommerce.infra.config.MonedaConfig;
import com.jeplabs.ecommerce.infra.config.WebpayConfig;
import com.jeplabs.ecommerce.infra.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests de WebpayService (Moneda CLP y Decimales)")
class WebpayServiceTest {

    @Mock private WebpayTransaccionRepository transaccionRepositorio;
    @Mock private OrdenRepository ordenRepositorio;
    @Mock private UsuarioRepository usuarioRepositorio;
    @Mock private EmailService emailService;
    @Mock private WebpayConfig webpayConfig;

    @InjectMocks
    private WebpayService webpayService;

    private Usuario usuario;
    private Orden orden;
    private MonedaConfig monedaConfig;
    private WebpayPlus.Transaction transactionMock;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(webpayService, "returnUrl", "http://localhost:5173/checkout/retorno");

        monedaConfig = new MonedaConfig();
        ReflectionTestUtils.setField(monedaConfig, "codigo", "CLP");
        ReflectionTestUtils.setField(monedaConfig, "decimales", 0);
        ReflectionTestUtils.setField(webpayService, "monedaConfig", monedaConfig);

        usuario = mock(Usuario.class);
        lenient().when(usuario.getId()).thenReturn(1L);
        lenient().when(usuario.getEmail()).thenReturn("cliente@chile.cl");
        lenient().when(usuario.getNombre()).thenReturn("Cliente");

        orden = mock(Orden.class);
        lenient().when(orden.getId()).thenReturn(105L);
        lenient().when(orden.getEstado()).thenReturn(EstadoOrden.PENDIENTE);
        lenient().when(orden.getUsuario()).thenReturn(usuario);

        transactionMock = mock(WebpayPlus.Transaction.class);
        lenient().when(webpayConfig.crearTransaction()).thenReturn(transactionMock);
    }

    @Test
    @DisplayName("Rechaza iniciar pago en Webpay cuando la moneda configurada no es CLP")
    void iniciar_conMonedaGtq_debeLanzarExcepcion() {
        ReflectionTestUtils.setField(monedaConfig, "codigo", "GTQ");
        when(usuarioRepositorio.findByEmail("cliente@chile.cl")).thenReturn(Optional.of(usuario));
        when(ordenRepositorio.findByIdAndUsuarioId(105L, 1L)).thenReturn(Optional.of(orden));

        assertThatThrownBy(() -> webpayService.iniciar("cliente@chile.cl", new DatosIniciarWebpay(105L)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("CLP");
    }

    @Test
    @DisplayName("Normaliza monto con decimales residuales a entero CLP y mantiene consistencia en WebpayTransaccion")
    void iniciar_conOrdenConDecimalesResiduales_debeEnviarMontoEnteroYGuardarMismoMonto() throws Exception {
        when(usuarioRepositorio.findByEmail("cliente@chile.cl")).thenReturn(Optional.of(usuario));
        when(ordenRepositorio.findByIdAndUsuarioId(105L, 1L)).thenReturn(Optional.of(orden));
        when(transaccionRepositorio.findByOrdenIdAndEstado(105L, EstadoWebpayTransaccion.INICIADA))
                .thenReturn(Optional.empty());

        when(orden.getTotal()).thenReturn(new BigDecimal("7742.25"), new BigDecimal("7742"));
        when(orden.getSubtotal()).thenReturn(new BigDecimal("7742.25"));
        when(orden.getCostoEnvio()).thenReturn(BigDecimal.ZERO);
        when(orden.getIva()).thenReturn(new BigDecimal("1236.00"));

        WebpayPlusTransactionCreateResponse createResponse = mock(WebpayPlusTransactionCreateResponse.class);
        when(createResponse.getToken()).thenReturn("tbk_tok_123");
        when(createResponse.getUrl()).thenReturn("https://webpay3gint.transbank.cl/webpayserver/initTransaction");

        ArgumentCaptor<Double> amountCaptor = ArgumentCaptor.forClass(Double.class);
        when(transactionMock.create(anyString(), anyString(), amountCaptor.capture(), anyString()))
                .thenReturn(createResponse);

        ArgumentCaptor<WebpayTransaccion> txCaptor = ArgumentCaptor.forClass(WebpayTransaccion.class);
        when(transaccionRepositorio.save(txCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        DatosRespuestaIniciarWebpay resp = webpayService.iniciar("cliente@chile.cl", new DatosIniciarWebpay(105L));

        assertThat(resp.token()).isEqualTo("tbk_tok_123");
        assertThat(amountCaptor.getValue()).isEqualTo(7742.0d);
        assertThat(txCaptor.getValue().getMonto()).isEqualByComparingTo(new BigDecimal("7742"));

        // Verificar que Caso 7 en confirmación aprueba cuando Transbank devuelve 7742.0
        WebpayTransaccion savedTx = txCaptor.getValue();
        when(transaccionRepositorio.findByToken("tbk_tok_123")).thenReturn(Optional.of(savedTx));

        WebpayPlusTransactionCommitResponse commitResponse = mock(WebpayPlusTransactionCommitResponse.class);
        when(commitResponse.getResponseCode()).thenReturn((byte) 0);
        when(commitResponse.getAmount()).thenReturn(7742.0d);
        when(commitResponse.getBuyOrder()).thenReturn("ORD-105-TEST");
        when(commitResponse.getAuthorizationCode()).thenReturn("1213");
        when(commitResponse.getPaymentTypeCode()).thenReturn("VD");
        when(commitResponse.getInstallmentsNumber()).thenReturn((byte) 0);
        when(transactionMock.commit("tbk_tok_123")).thenReturn(commitResponse);

        DatosRespuestaConfirmarWebpay confirmResp = webpayService.confirmar("tbk_tok_123", null);
        assertThat(confirmResp.success()).isTrue();
    }
}
