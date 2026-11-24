import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminProductListView from './AdminProductListView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

describe('Accesibilidad — AdminProductListView, Filtros y Tabla de Productos', () => {
    beforeEach(() => {
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA en el listado de productos con filtros y tabla estructurada', async () => {
        const onNavigate = vi.fn();

        const { container } = render(
            <MemoryRouter initialEntries={['/admin/products']}>
                <AppProviders>
                    <AdminProductListView onNavigate={onNavigate} />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { level: 1, name: /productos/i })
            ).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
