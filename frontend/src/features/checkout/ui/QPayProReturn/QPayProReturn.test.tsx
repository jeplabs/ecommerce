import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { QPayProReturnPage } from '@/pages/checkout';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import {
    addDynamicOrder,
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
} from '@/test/msw/fixtures/orders-registry';

function renderQPayProReturn(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppProviders>
                <Routes>
                    <Route path="/checkout/qpaypro/retorno" element={<QPayProReturnPage />} />
                    <Route path="/checkout/success" element={<div>SUCCESS_OK</div>} />
                    <Route path="/profile/ordenes" element={<div>ORDENES_OK</div>} />
                    <Route path="/checkout" element={<div>CHECKOUT_OK</div>} />
                </Routes>
            </AppProviders>
        </MemoryRouter>
    );
}

function seedSession() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_CUSTOMER');
}

describe('QPayProReturn', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('procesa el retorno exitoso y navega a /checkout/success cuando la orden está confirmada', async () => {
        seedSession();
        const pending = findDynamicOrder(MOCK_ORDER_PENDING_ID);
        if (pending) {
            addDynamicOrder({
                ...pending,
                estado: 'CONFIRMADA',
            });
        }

        renderQPayProReturn(`/checkout/qpaypro/retorno?ordenId=${MOCK_ORDER_PENDING_ID}&status=success`);

        expect(
            await screen.findByText('SUCCESS_OK', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });

    it('muestra pantalla de recuperación cuando la orden no está confirmada (status=failure)', async () => {
        seedSession();
        const pending = findDynamicOrder(MOCK_ORDER_PENDING_ID);
        if (pending) {
            addDynamicOrder({
                ...pending,
                estado: 'PENDIENTE',
            });
        }

        renderQPayProReturn(`/checkout/qpaypro/retorno?ordenId=${MOCK_ORDER_PENDING_ID}&status=failure`);

        expect(
            await screen.findByText(/El pago con QPayPro fue rechazado o cancelado/i, {}, { timeout: 5000 })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Intentar pagar nuevamente/i })).toBeInTheDocument();
    });
});

