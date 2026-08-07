import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/providers', async (importOriginal) => {
    const mod = await importOriginal<typeof import('@/app/providers')>();
    return {
        ...mod,
        useCart: vi.fn(),
    };
});

vi.mock('@/widgets/checkout/CheckoutSuccessView', () => ({
    default: ({ orden, payment, isBankTransfer }: {
        orden: { id: number };
        payment: unknown;
        isBankTransfer: boolean;
    }) => (
        <div data-testid="success-view">
            orden-{orden.id} | bt-{String(isBankTransfer)} | payment-{payment ? 'si' : 'no'}
        </div>
    ),
}));

import { useCart } from '@/app/providers';
import { CheckoutSuccessPage } from './CheckoutSuccessPage';
import {
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
    resetDynamicOrders,
} from '@/test/msw/fixtures/orders-registry';

const useCartMock = vi.mocked(useCart);
const refreshCart = vi.fn().mockResolvedValue(undefined);
resetDynamicOrders();
const orden = findDynamicOrder(MOCK_ORDER_PENDING_ID)!;

function renderPage(initialState?: unknown) {
    return render(
        <MemoryRouter initialEntries={[{ pathname: '/checkout/success', state: initialState }]}>
            <Routes>
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/catalogo" element={<div>Catálogo</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('CheckoutSuccessPage', () => {
    it('redirige al catálogo si no hay orden en el estado', () => {
        useCartMock.mockReturnValue({ refreshCart } as never);
        renderPage();

        expect(screen.getByText('Catálogo')).toBeInTheDocument();
        expect(refreshCart).toHaveBeenCalled();
    });

    it('muestra la vista de éxito con la orden', () => {
        useCartMock.mockReturnValue({ refreshCart } as never);
        renderPage({ orden, payment: null, isBankTransfer: false });

        expect(screen.getByTestId('success-view')).toHaveTextContent(
            `orden-${orden.id} | bt-false | payment-no`
        );
        expect(screen.getByRole('link', { name: '← Seguir comprando' })).toHaveAttribute(
            'href',
            '/catalogo'
        );
        expect(screen.getByText('Confirmación')).toBeInTheDocument();
    });

    it('pasa isBankTransfer y payment a la vista', () => {
        useCartMock.mockReturnValue({ refreshCart } as never);
        renderPage({ orden, payment: { transactionId: 'TX' }, isBankTransfer: true });

        expect(screen.getByTestId('success-view')).toHaveTextContent('bt-true');
        expect(screen.getByTestId('success-view')).toHaveTextContent('payment-si');
    });
});
