import { http, HttpResponse } from 'msw';
import { ZodError } from 'zod';
import { describe, expect, it } from 'vitest';
import { confirmarWebpay, iniciarWebpay } from '@/features/checkout/api';
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
            returnUrl: 'http://localhost:5173/checkout/webpay/retorno',
        });

        expect(result.url).toContain('https://');
        expect(result.token).toContain('tok_test_');
    });

    it('lanza ApiError con el error del body cuando iniciar responde 400', async () => {
        seedSession();

        await expect(
            iniciarWebpay({ ordenId: Number.NaN, returnUrl: 'x' })
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

    it('envía el returnUrl y el ordenId al iniciar (assert del body)', async () => {
        seedSession();
        let received: unknown;
        server.use(
            http.post(iniciarPath, async ({ request }) => {
                received = await request.json();
                return HttpResponse.json({ url: 'https://x', token: 't' });
            })
        );

        await iniciarWebpay({ ordenId: 9, returnUrl: 'https://app.test/retorno' });

        expect(received).toEqual({ ordenId: 9, returnUrl: 'https://app.test/retorno' });
    });

    it('expone iniciarWebpay y confirmarWebpay a través de paymentGatewayApi', async () => {
        const { paymentGatewayApi } = await import('@/features/checkout/api');
        expect(paymentGatewayApi.iniciarWebpay).toBe(iniciarWebpay);
        expect(paymentGatewayApi.confirmarWebpay).toBe(confirmarWebpay);
        expect(paymentGatewayApi.iniciarWebpay).toBeTypeOf('function');
        expect(paymentGatewayApi.confirmarWebpay).toBeTypeOf('function');
    });
});
