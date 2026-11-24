import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders, ProfileProvider } from '@/app/providers';
import OrdersTab from './OrdersTab';
import OrderDetail from '../OrderDetail/OrderDetail';
import OrderDetailModal from '../OrderDetailModal/OrderDetailModal';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockCreatedOrder } from '@/test/msw/fixtures/orders';
import type { CartApi } from '@/features/cart';

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <MemoryRouter initialEntries={['/profile/ordenes']}>
            <AppProviders>
                <ProfileProvider>{children}</ProfileProvider>
            </AppProviders>
        </MemoryRouter>
    );
}

const testCart: CartApi = {
    id: 1,
    estado: 'ACTIVO',
    expiraAt: null,
    items: [
        {
            id: 1,
            productoId: 10,
            skuProducto: 'SKU-001',
            nombreProducto: 'Café de Especialidad',
            cantidad: 2,
            precioUnitario: 15.5,
            subtotal: 31,
        },
    ],
    total: 31,
    totalItems: 2,
};

const mockOrder = mockCreatedOrder({
    direccionId: 1,
    servicioEnvioId: 1,
    cart: testCart,
});

describe('Accesibilidad — OrdersTab, OrderDetail y OrderDetailModal', () => {
    beforeEach(() => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
    });

    it('cumple con WCAG 2.1 AA en el listado de historial de pedidos', async () => {
        const { container } = render(<OrdersTab />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /mis pedidos/i })).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA en el componente OrderDetail', async () => {
        const { container } = render(
            <MemoryRouter>
                <AppProviders>
                    <OrderDetail
                        orden={mockOrder}
                        onClose={vi.fn()}
                        onCancel={vi.fn()}
                        cancelling={false}
                        titleId="order-detail-title"
                    />
                </AppProviders>
            </MemoryRouter>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA en OrderDetailModal abierto', async () => {
        render(
            <MemoryRouter>
                <AppProviders>
                    <OrderDetailModal
                        isOpen={true}
                        loading={false}
                        orden={mockOrder}
                        onClose={vi.fn()}
                        onCancel={vi.fn()}
                        cancelling={false}
                    />
                </AppProviders>
            </MemoryRouter>
        );

        const dialog = screen.getByRole('dialog');
        const results = await axe(dialog);
        expect(results).toHaveNoViolations();
    });
});
