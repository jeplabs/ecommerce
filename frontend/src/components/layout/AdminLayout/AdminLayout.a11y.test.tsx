import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminLayout from './AdminLayout';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

describe('Accesibilidad — AdminLayout', () => {
    beforeEach(() => {
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA en el layout principal con tabs de navegación', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin']}>
                <AppProviders>
                    <AdminLayout />
                </AppProviders>
            </MemoryRouter>
        );

        expect(screen.getByRole('navigation', { name: /navegación de administración/i })).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA en subrutas con barra de breadcrumbs', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/users/1/edit']}>
                <AppProviders>
                    <AdminLayout />
                </AppProviders>
            </MemoryRouter>
        );

        expect(screen.getByRole('navigation', { name: /ruta de navegación/i })).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
