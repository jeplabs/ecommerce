import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { CheckoutReturnPage } from '@/pages/checkout';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { API_BASE } from '@/test/msw/constants';
import { server } from '@/test/msw/server';
import {
    addDynamicOrder,
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
} from '@/test/msw/fixtures/orders-registry';

const confirmarPath = `${API_BASE}/api/pagos/webpay/confirmar`;

function renderReturn(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppProviders>
                <Routes>
                    <Route path="/checkout/retorno" element={<CheckoutReturnPage />} />
                    <Route path="/checkout/success" element={<div>SUCCESS_OK</div>} />
                    <Route path="/profile/ordenes" element={<div>ORDENES_OK</div>} />
                    <Route path="/login" element={<div>LOGIN_OK</div>} />
                </Routes>
            </AppProviders>
        </MemoryRouter>
    );
}

function seedSession() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_CUSTOMER');
}

describe('CheckoutReturn', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('confirma con token_ws y navega a /checkout/success', async () => {
        seedSession();
        const pending = findDynamicOrder(MOCK_ORDER_PENDING_ID);
        if (pending) addDynamicOrder(pending);

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('SUCCESS_OK', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('muestra "Pago no completado" cuando llega TBK_TOKEN sin token_ws', async () => {
        seedSession();

        renderReturn('/checkout/retorno?TBK_TOKEN=abc&TBK_ORDEN_COMPRA=501&TBK_ID_SESION=1');

        expect(
            await screen.findByText('Pago no completado', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('muestra "Se agotó el tiempo" cuando llega TBK_ORDEN_COMPRA sin token_ws', async () => {
        seedSession();

        renderReturn('/checkout/retorno?TBK_ORDEN_COMPRA=501');

        expect(
            await screen.findByText('Se agotó el tiempo', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('muestra error cuando el retorno no trae datos de Webpay', () => {
        seedSession();

        renderReturn('/checkout/retorno');

        expect(screen.getByText('Error al confirmar el pago')).toBeInTheDocument();
        expect(
            screen.getByText('Retorno de Webpay inválido: faltan datos.')
        ).toBeInTheDocument();
    });

    it('muestra "Pago rechazado" cuando Webpay confirma el rechazo', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json(
                    { success: false, error: 'Rechazada por el banco', motivo: 'REJECTED' },
                    { status: 200 }
                )
            )
        );

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('Pago rechazado', {}, { timeout: 5000 })
        ).toBeInTheDocument();
        expect(
            screen.getByText('Tu tarjeta fue rechazada por el banco.')
        ).toBeInTheDocument();
    });

    it('muestra "Se agotó el tiempo" cuando Webpay confirma timeout', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json(
                    { success: false, error: 'Timeout', motivo: 'TIMEOUT' },
                    { status: 200 }
                )
            )
        );

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('Se agotó el tiempo', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('muestra "Pago no completado" cuando Webpay confirma abandono', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json(
                    { success: false, error: 'Abandonado', motivo: 'ABORTED' },
                    { status: 200 }
                )
            )
        );

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('Pago no completado', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('redirige a /login cuando confirmar responde 401', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json({ error: 'No autorizado' }, { status: 401 })
            )
        );

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('LOGIN_OK', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('no vuelve a confirmar si el efecto se re-ejecuta tras la primera vez', async () => {
        seedSession();

        render(
            <MemoryRouter initialEntries={['/checkout/retorno?TBK_ORDEN_COMPRA=501']}>
                <AppProviders>
                    <Routes>
                        <Route
                            path="/checkout/retorno"
                            element={
                                <>
                                    <CheckoutReturnPage />
                                    <Link to="/checkout/retorno?token_ws=tok_test_501">
                                        cambiar a token
                                    </Link>
                                </>
                            }
                        />
                        <Route path="/checkout/success" element={<div>SUCCESS_OK</div>} />
                    </Routes>
                </AppProviders>
            </MemoryRouter>
        );

        expect(
            await screen.findByText('Se agotó el tiempo', {}, { timeout: 5000 })
        ).toBeInTheDocument();

        await userEvent.click(screen.getByText('cambiar a token'));

        expect(screen.queryByText('SUCCESS_OK')).not.toBeInTheDocument();
        expect(screen.getByText('Se agotó el tiempo')).toBeInTheDocument();
    });
});

describe('CheckoutReturn recuperación de pago', () => {
    beforeEach(() => {
        seedSession();
        sessionStorage.clear();
    });

    it('muestra el resumen del pedido y las acciones de recuperación', async () => {
        sessionStorage.setItem('webpay:ordenPendienteId', '501');

        renderReturn('/checkout/retorno?TBK_TOKEN=abc');

        expect(
            await screen.findByText('Resumen del pedido #501', {}, { timeout: 5000 })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Intentar pagar nuevamente' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Cancelar pedido' })
        ).toBeInTheDocument();
        expect(screen.getByText('Tu pedido sigue reservado: puedes reintentar el pago o cancelarlo.')).toBeInTheDocument();
    });

    it('reintenta el pago redirigiendo de nuevo a Webpay', async () => {
        const submitSpy = vi
            .spyOn(HTMLFormElement.prototype, 'submit')
            .mockImplementation(() => {});
        sessionStorage.setItem('webpay:ordenPendienteId', '501');

        renderReturn('/checkout/retorno?TBK_TOKEN=abc');

        const retryBtn = await screen.findByRole(
            'button',
            { name: 'Intentar pagar nuevamente' },
            { timeout: 5000 }
        );
        await userEvent.click(retryBtn);

        const form = await screen.findByTestId('webpay-redirect-form', {}, { timeout: 5000 });
        expect(form).toHaveAttribute('method', 'POST');
        expect(form.querySelector('input[name="token_ws"]')).toHaveValue('tok_test_501');

        submitSpy.mockRestore();
    });

    it('cancela el pedido y navega a las órdenes', async () => {
        sessionStorage.setItem('webpay:ordenPendienteId', '501');

        renderReturn('/checkout/retorno?TBK_ORDEN_COMPRA=501');

        const cancelBtn = await screen.findByRole(
            'button',
            { name: 'Cancelar pedido' },
            { timeout: 5000 }
        );
        await userEvent.click(cancelBtn);

        expect(
            await screen.findByText('ORDENES_OK', {}, { timeout: 5000 })
        ).toBeInTheDocument();
        expect(sessionStorage.getItem('webpay:ordenPendienteId')).toBeNull();
    });

    it('redirige a éxito cuando el webhook ya confirmó la orden', async () => {
        const pending = findDynamicOrder(MOCK_ORDER_PENDING_ID);
        if (pending) addDynamicOrder({ ...pending, estado: 'CONFIRMADA' });
        sessionStorage.setItem('webpay:ordenPendienteId', '501');

        renderReturn('/checkout/retorno?TBK_ORDEN_COMPRA=501');

        expect(
            await screen.findByText('SUCCESS_OK', {}, { timeout: 5000 })
        ).toBeInTheDocument();
        expect(sessionStorage.getItem('webpay:ordenPendienteId')).toBeNull();
    });

    it('muestra el mensaje simple cuando no hay pedido que recuperar', () => {
        renderReturn('/checkout/retorno?TBK_TOKEN=abc');

        expect(screen.getByText('Pago no completado')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'Volver al checkout' })
        ).toBeInTheDocument();
    });

    it('redirige a /login cuando obtenerOrden responde 401', async () => {
        sessionStorage.setItem('webpay:ordenPendienteId', '501');
        server.use(
            http.get(`${API_BASE}/api/ordenes/501`, () =>
                HttpResponse.json({ error: 'No autorizado' }, { status: 401 })
            )
        );

        renderReturn('/checkout/retorno?TBK_ORDEN_COMPRA=501');

        expect(
            await screen.findByText('LOGIN_OK', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });
});
