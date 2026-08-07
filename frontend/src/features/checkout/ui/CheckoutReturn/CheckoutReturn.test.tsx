import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
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
    it('confirma con token_ws y navega a /checkout/success', async () => {
        seedSession();
        const pending = findDynamicOrder(MOCK_ORDER_PENDING_ID);
        if (pending) addDynamicOrder(pending);

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(await screen.findByText('SUCCESS_OK')).toBeInTheDocument();
    });

    it('muestra "Pago no completado" cuando llega TBK_TOKEN sin token_ws', () => {
        seedSession();

        renderReturn('/checkout/retorno?TBK_TOKEN=abc&TBK_ORDEN_COMPRA=501&TBK_ID_SESION=1');

        expect(screen.getByText('Pago no completado')).toBeInTheDocument();
    });

    it('muestra "Se agotó el tiempo" cuando llega TBK_ORDEN_COMPRA sin token_ws', () => {
        seedSession();

        renderReturn('/checkout/retorno?TBK_ORDEN_COMPRA=501');

        expect(screen.getByText('Se agotó el tiempo')).toBeInTheDocument();
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

        expect(await screen.findByText('Pago rechazado')).toBeInTheDocument();
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

        expect(await screen.findByText('Se agotó el tiempo')).toBeInTheDocument();
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

        expect(await screen.findByText('Pago no completado')).toBeInTheDocument();
    });

    it('redirige a /login cuando confirmar responde 401', async () => {
        seedSession();
        server.use(
            http.post(confirmarPath, () =>
                HttpResponse.json({ error: 'No autorizado' }, { status: 401 })
            )
        );

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(await screen.findByText('LOGIN_OK')).toBeInTheDocument();
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

        expect(await screen.findByText('Se agotó el tiempo')).toBeInTheDocument();

        await userEvent.click(screen.getByText('cambiar a token'));

        expect(screen.queryByText('SUCCESS_OK')).not.toBeInTheDocument();
        expect(screen.getByText('Se agotó el tiempo')).toBeInTheDocument();
    });
});
