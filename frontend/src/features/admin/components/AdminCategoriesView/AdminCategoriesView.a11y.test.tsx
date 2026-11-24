import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminCategoriesView from './AdminCategoriesView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

describe('Accesibilidad — AdminCategoriesView, Modales y Tabla Jerárquica', () => {
    beforeEach(() => {
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA en la vista principal con tabla jerárquica de categorías', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/categorias']}>
                <AppProviders>
                    <AdminCategoriesView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA cuando se abre el modal de crear categoría', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/categorias']}>
                <AppProviders>
                    <AdminCategoriesView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const newBtn = screen.getByRole('button', { name: /\+ nueva categoría raíz/i });
        fireEvent.click(newBtn);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();

        const results = await axe(dialog);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA cuando se abre el modal de confirmación de eliminación', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/categorias']}>
                <AppProviders>
                    <AdminCategoriesView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
        fireEvent.click(deleteButtons[0]!);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();

        const results = await axe(dialog);
        expect(results).toHaveNoViolations();
    });
});
