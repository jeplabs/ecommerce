import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminOrdersView from './AdminOrdersView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicOrders } from '@/test/msw/fixtures/orders-registry';

describe('Accesibilidad — AdminOrdersView y AdminOrdersTable', () => {
    beforeEach(() => {
        resetDynamicOrders();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA en el listado de órdenes y tabla de gestión de estados', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/orders']}>
                <AppProviders>
                    <AdminOrdersView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { level: 1, name: /historial de pedidos/i })
            ).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
