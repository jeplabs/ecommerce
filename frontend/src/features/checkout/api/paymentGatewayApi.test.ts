import { http, HttpResponse } from 'msw';
import { ZodError } from 'zod';
import { describe, expect, it } from 'vitest';
import { confirmarWebpay, consultarEstadoWebpay, iniciarWebpay, notificarTimeout, iniciarQPayPro, consultarEstadoQPayPro } from '@/features/checkout/api';
import { ApiError } from '@/shared';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { API_BASE } from '@/test/msw/constants';
import { server } from '@/test/msw/server';

function seedSession() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

const confirmarPath = `${API_BASE}/api/pagos/webpay/confirmar`;
const iniciarPath = `${API_BASE}/api/pagos/webpay/iniciar`;

describe('paymentGatewayApi', () => {
    it('inicia Webpay y devuelve url + token', async () => {
        seedSession();

        const result = await iniciarWebpay({
            ordenId: 501,
        });

        expect(result.url).toContain('https://');
        expect(result.token).toContain('tok_test_');
    });

    it('inicia QPayPro y devuelve redirectUrl', async () => {
        seedSession();

        const result = await iniciarQPayPro({ ordenId: 501 });

        expect(result.redirectUrl).toContain('https://sandboxpayments.qpaypro.com/checkout/store?token=tok_qpaypro_501');
    });

    it('consulta estado QPayPro', async () => {
        seedSession();

        const estado = await consultarEstadoQPayPro(501);

        expect(estado.ordenId).toBe(501);
        expect(estado.estado).toBeDefined();
    });

    it('lanza ApiError con el error del body cuando iniciar responde 400', async () => {
        seedSession();

        await expect(
            iniciarWebpay({ ordenId: Number.NaN })
        ).rejects.toThrow('Datos incompletos');
    });

    it('confirma Webpay y devuelve la orden CONFIRMADA', async () => {
        seedSession();

        const result = await confirmarWebpay('tok_test_501');

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.orden.estado).toBe('CONFIRMADA');
            expect(result.orden.metodoPago).toBe('WEBPAY');
            expect(result.payment.transactionId).toBe('TX_WEBPAY_001');
        }
    });

    it('lanza ApiError con status 401 cuando confirmar responde 401', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json({ error: 'No autorizado' }, { status: 401 })
            )
        );

        const promise = confirmarWebpay('tok_test_501');

        await expect(promise).rejects.toMatchObject({ status: 401, name: 'ApiError' });
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('usa el mensaje por defecto cuando el error 500 no trae body JSON', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.text('Internal server error', { status: 500 })
            )
        );

        await expect(confirmarWebpay('tok_test_501')).rejects.toThrow(
            'Error al confirmar el pago Webpay'
        );
    });

    it('lanza ZodError cuando una respuesta 200 no es JSON válido', async () => {
        seedSession();
        server.use(http.post(confirmarPath, () => HttpResponse.text('not-json')));

        await expect(confirmarWebpay('tok_test_501')).rejects.toBeInstanceOf(ZodError);
    });

    it('lanza ApiError cuando confirmar responde 404', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
            )
        );

        await expect(confirmarWebpay('tok_test_501')).rejects.toThrow(
            'Transacción no encontrada'
        );
    });

    it('envía solo el ordenId al iniciar (el returnUrl lo fija el backend)', async () => {
        seedSession();
        let received: unknown;
        server.use(
            http.post(iniciarPath, async ({ request }) => {
                received = await request.json();
                return HttpResponse.json({ url: 'https://x', token: 't' });
            })
        );

        await iniciarWebpay({ ordenId: 9 });

        expect(received).toEqual({ ordenId: 9 });
        expect(received as object).not.toHaveProperty('returnUrl');
    });

    it('notifica el timeout enviando TBK_ID_SESION y TBK_ORDEN_COMPRA', async () => {
        seedSession();
        let params: URLSearchParams | null = null;
        server.use(
            http.get(confirmarPath, ({ request }) => {
                params = new URL(request.url).searchParams;
                return HttpResponse.json({
                    success: false,
                    error: 'Se agotó el tiempo en Webpay',
                    motivo: 'TIMEOUT',
                });
            })
        );

        await notificarTimeout('sess-1', '501');

        expect(params?.get('TBK_ID_SESION')).toBe('sess-1');
        expect(params?.get('TBK_ORDEN_COMPRA')).toBe('501');
    });

    it('expone iniciarWebpay y confirmarWebpay a través de paymentGatewayApi', async () => {
        const { paymentGatewayApi } = await import('@/features/checkout/api');
        expect(paymentGatewayApi.iniciarWebpay).toBe(iniciarWebpay);
        expect(paymentGatewayApi.confirmarWebpay).toBe(confirmarWebpay);
        expect(paymentGatewayApi.iniciarQPayPro).toBe(iniciarQPayPro);
        expect(paymentGatewayApi.consultarEstadoQPayPro).toBe(consultarEstadoQPayPro);
    });

    it('consulta el estado Webpay y lo parsea con motivo null', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/pagos/webpay/estado/:ordenId`, ({ params }) =>
                HttpResponse.json({
                    ordenId: Number(params.ordenId),
                    estado: 'INICIADA',
                    motivo: null,
                })
            )
        );

        const estado = await consultarEstadoWebpay(501);

        expect(estado).toEqual({ ordenId: 501, estado: 'INICIADA', motivo: null });
    });

    it('lanza ApiError cuando consultar el estado responde 404', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/pagos/webpay/estado/:ordenId`, () =>
                HttpResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
            )
        );

        await expect(consultarEstadoWebpay(99999)).rejects.toThrow(
            'Transacción no encontrada'
        );
    });

    it('lanza ZodError cuando el estado trae un valor desconocido', async () => {
        seedSession();
        server.use(
            http.get(`${API_BASE}/api/pagos/webpay/estado/:ordenId`, () =>
                HttpResponse.json({ ordenId: 1, estado: 'INEXISTENTE' })
            )
        );

        await expect(consultarEstadoWebpay(1)).rejects.toBeInstanceOf(ZodError);
    });

    it('lanza ApiError cuando notificarTimeout responde 404', async () => {
        seedSession();
        server.use(
            http.get(confirmarPath, () =>
                HttpResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
            )
        );

        await expect(notificarTimeout('sess-1')).rejects.toThrow('Transacción no encontrada');
    });
});
