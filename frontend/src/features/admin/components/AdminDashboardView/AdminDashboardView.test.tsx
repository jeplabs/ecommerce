import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicOrders } from '@/test/msw/fixtures/orders-registry';
import { resetDynamicUsers } from '@/test/msw/fixtures/users-registry';
import AdminDashboardView from './AdminDashboardView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminDashboardView', () => {
    beforeEach(() => {
        resetDynamicOrders();
        resetDynamicUsers();
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('muestra estado de carga y luego renderiza KPIs, desglose por estado y últimas órdenes', async () => {
        renderWithProviders(<AdminDashboardView />);

        expect(screen.getByText('Cargando estadísticas…')).toBeInTheDocument();

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: 'Panel de administración' })
            ).toBeInTheDocument();
        });

        expect(screen.getByText('Usuarios')).toBeInTheDocument();
        expect(screen.getByText('Productos')).toBeInTheDocument();
        expect(screen.getByText('Órdenes')).toBeInTheDocument();
        expect(screen.getByText('Revenue total')).toBeInTheDocument();
        expect(screen.getByText('Ticket promedio')).toBeInTheDocument();
        expect(screen.getByText('Órdenes por estado')).toBeInTheDocument();
        expect(screen.getByText('Últimas órdenes')).toBeInTheDocument();

        const verTodasLink = screen.getByRole('link', { name: 'Ver todas →' });
        expect(verTodasLink).toHaveAttribute('href', '/admin/orders');
    });
});
