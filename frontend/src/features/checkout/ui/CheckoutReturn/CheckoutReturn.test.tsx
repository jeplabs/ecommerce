import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { CheckoutReturnPage } from '@/pages/checkout';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import {
    addDynamicOrder,
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
} from '@/test/msw/fixtures/orders-registry';

function renderReturn(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <AppProviders>
                <Routes>
                    <Route path="/checkout/retorno" element={<CheckoutReturnPage />} />
                    <Route path="/checkout/success" element={<div>SUCCESS_OK</div>} />
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
});