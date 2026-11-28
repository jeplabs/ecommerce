import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicSynonyms } from '@/test/msw/fixtures/synonyms-registry';
import { AdminSynonymsView } from './AdminSynonymsView';

describe('Accesibilidad — AdminSynonymsView, Modales y Tabla de Sinónimos', () => {
    beforeEach(() => {
        resetDynamicSynonyms();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA en la vista principal con tabla de sinónimos', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/sinonimos']}>
                <AppProviders>
                    <AdminSynonymsView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA cuando se abre el modal de crear grupo de sinónimos', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/sinonimos']}>
                <AppProviders>
                    <AdminSynonymsView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole('button', { name: /\+ Nuevo Grupo de Sinónimos/i })
        );

        const dialog = await screen.findByRole('dialog');
        expect(dialog).toBeInTheDocument();

        const results = await axe(dialog);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA cuando se abre el diálogo de confirmación de eliminación', async () => {
        render(
            <MemoryRouter initialEntries={['/admin/sinonimos']}>
                <AppProviders>
                    <AdminSynonymsView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('laptops')).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole('button', { name: /Eliminar grupo laptops/i })
        );

        const deleteDialog = await screen.findByRole('dialog', {
            name: /Eliminar grupo de sinónimos/i,
        });
        expect(deleteDialog).toBeInTheDocument();

        const results = await axe(deleteDialog);
        expect(results).toHaveNoViolations();
    });
});
