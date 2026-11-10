import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CheckoutSuccessView } from './CheckoutSuccessView';
import {
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
    resetDynamicOrders,
} from '@/test/msw/fixtures/orders-registry';

resetDynamicOrders();
const mockOrden = findDynamicOrder(MOCK_ORDER_PENDING_ID)!;

const refreshCartMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/app/providers', () => ({
    useCart: () => ({ refreshCart: refreshCartMock }),
}));

vi.mock('../success/OrderConfirmationSummary/OrderConfirmationSummary', () => ({
    default: ({ orden, isBankTransfer }: { orden: { id: number }; isBankTransfer: boolean }) => (
        <div data-testid="order-summary">
            summary-{orden.id}-{String(isBankTransfer)}
        </div>
    ),
}));

vi.mock('../success/CheckoutSuccessActions/CheckoutSuccessActions', () => ({
    default: () => <div data-testid="success-actions">actions</div>,
}));

vi.mock('../success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations', () => ({
    default: () => <div data-testid="success-recommendations">recommendations</div>,
}));

function renderWithRouter(ui: React.ReactNode, initialEntries = ['/checkout/success']) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/checkout/success" element={ui} />
                <Route path="/catalogo" element={<div>Página Catálogo</div>} />
                <Route path="/" element={<div>Inicio</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('CheckoutSuccessView (BPR)', () => {
    beforeEach(() => {
        resetDynamicOrders();
        vi.clearAllMocks();
    });

    it('redirige al catálogo si no hay orden en el estado ni en query params', () => {
        renderWithRouter(<CheckoutSuccessView />);
        expect(screen.getByText('Página Catálogo')).toBeInTheDocument();
    });

    it('renderiza resumen, acciones y recomendaciones cuando se provee la orden por state', () => {
        renderWithRouter(
            <CheckoutSuccessView />,
            [{ pathname: '/checkout/success', state: { orden: mockOrden } }] as never
        );

        expect(screen.getByTestId('order-summary')).toHaveTextContent(`summary-${mockOrden.id}-false`);
        expect(screen.getByTestId('success-actions')).toBeInTheDocument();
        expect(screen.getByTestId('success-recommendations')).toBeInTheDocument();
        expect(refreshCartMock).toHaveBeenCalled();
    });

    it('soporta orden pasada directamente por props con flag de transferencia bancaria', () => {
        renderWithRouter(<CheckoutSuccessView orden={mockOrden} isBankTransfer={true} />);

        expect(screen.getByTestId('order-summary')).toHaveTextContent(`summary-${mockOrden.id}-true`);
    });
});
