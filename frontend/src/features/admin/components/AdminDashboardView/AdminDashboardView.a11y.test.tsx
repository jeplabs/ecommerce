import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminDashboardView from './AdminDashboardView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicOrders } from '@/test/msw/fixtures/orders-registry';
import { resetDynamicUsers } from '@/test/msw/fixtures/users-registry';

describe('Accesibilidad — AdminDashboardView', () => {
    beforeEach(() => {
        resetDynamicOrders();
        resetDynamicUsers();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA al renderizar KPIs, estado de órdenes y tabla de órdenes recientes', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin']}>
                <AppProviders>
                    <AdminDashboardView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { level: 1, name: /panel de administración/i })
            ).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
