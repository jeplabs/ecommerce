import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { CheckoutReturnPage } from '@/pages/checkout';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { confirmarWebpay } from '@/features/checkout/api/paymentGatewayApi';

vi.mock('@/features/checkout/api/paymentGatewayApi', () => ({
    paymentGatewayApi: {
        iniciarWebpay: vi.fn(),
        confirmarWebpay: vi.fn(),
        notificarAbortada: vi.fn(),
        notificarTimeout: vi.fn(),
    },
    iniciarWebpay: vi.fn(),
    confirmarWebpay: vi.fn(),
    notificarAbortada: vi.fn(),
    notificarTimeout: vi.fn(),
}));

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

describe('CheckoutReturn errores de confirmación', () => {
    beforeEach(() => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
    });

    it('muestra el mensaje de un error genérico', async () => {
        vi.mocked(confirmarWebpay).mockRejectedValueOnce(new Error('Fallo en la red'));

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('Error al confirmar el pago', {}, { timeout: 5000 })
        ).toBeInTheDocument();
        expect(screen.getByText('Fallo en la red')).toBeInTheDocument();
    });

    it('usa el mensaje por defecto cuando el error no es una instancia de Error', async () => {
        vi.mocked(confirmarWebpay).mockRejectedValueOnce('boom');

        renderReturn('/checkout/retorno?token_ws=tok_test_501');

        expect(
            await screen.findByText('No pudimos confirmar tu pago.', {}, { timeout: 5000 })
        ).toBeInTheDocument();
    });
});
