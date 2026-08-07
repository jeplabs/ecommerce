import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/checkout/ui/success/CheckoutSuccessHeader/CheckoutSuccessHeader', () => ({
    default: ({ orderId, isBankTransfer }: { orderId: number; isBankTransfer: boolean }) => (
        <div>header-{orderId}-{String(isBankTransfer)}</div>
    ),
}));

vi.mock('@/features/checkout/ui/success/OrderConfirmationSummary/OrderConfirmationSummary', () => ({
    default: ({ orden, payment, isBankTransfer }: {
        orden: { id: number };
        payment: unknown;
        isBankTransfer: boolean;
    }) => <div>summary-{orden.id}-{String(isBankTransfer)}</div>,
}));

vi.mock('@/features/checkout/ui/success/CheckoutSuccessActions/CheckoutSuccessActions', () => ({
    default: () => <div>actions</div>,
}));

vi.mock('@/features/checkout/ui/success/CheckoutSuccessRecommendations/CheckoutSuccessRecommendations', () => ({
    default: () => <div>recommendations</div>,
}));

import CheckoutSuccessView from './CheckoutSuccessView';
import {
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
    resetDynamicOrders,
} from '@/test/msw/fixtures/orders-registry';

resetDynamicOrders();
const orden = findDynamicOrder(MOCK_ORDER_PENDING_ID)!;

describe('CheckoutSuccessView', () => {
    it('compone header, resumen, acciones y recomendaciones', () => {
        render(<CheckoutSuccessView orden={orden} />);

        expect(screen.getByText(`header-${orden.id}-false`)).toBeInTheDocument();
        expect(screen.getByText(`summary-${orden.id}-false`)).toBeInTheDocument();
        expect(screen.getByText('actions')).toBeInTheDocument();
        expect(screen.getByText('recommendations')).toBeInTheDocument();
    });

    it('pasa isBankTransfer y payment a los hijos', () => {
        render(
            <CheckoutSuccessView
                orden={orden}
                payment={{ transactionId: 'TX' }}
                isBankTransfer
            />
        );

        expect(screen.getByText(`header-${orden.id}-true`)).toBeInTheDocument();
        expect(screen.getByText(`summary-${orden.id}-true`)).toBeInTheDocument();
    });
});
