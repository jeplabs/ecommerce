import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminCategoriesView from './AdminCategoriesView';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/categorias']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

function seedAdminToken() {
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('AdminCategoriesView', () => {
    beforeEach(() => {
        seedAdminToken();
    });

    it('renderiza el título, estadísticas y las categorías del mock', async () => {
        renderWithProviders(<AdminCategoriesView />);

        expect(screen.getByRole('heading', { name: /Gestión de Categorías/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\+ Nueva Categoría Raíz/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
            expect(screen.getByText('Audio')).toBeInTheDocument();
        });

        expect(screen.getByText(/Total:/i)).toBeInTheDocument();
        expect(screen.getByText(/Raíces:/i)).toBeInTheDocument();
    });

    it('abre el modal para crear categoría raíz al pulsar el botón', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const newBtn = screen.getByRole('button', { name: /\+ Nueva Categoría Raíz/i });
        fireEvent.click(newBtn);

        expect(screen.getByRole('heading', { name: /Nueva categoría/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre de la categoría/i)).toBeInTheDocument();
    });

    it('abre el modal en modo edición con los datos precargados', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        const editBtns = screen.getAllByRole('button', { name: /Editar/i });
        fireEvent.click(editBtns[0]);

        expect(screen.getByRole('heading', { name: /Editar categoría/i })).toBeInTheDocument();
        const input = screen.getByLabelText(/Nombre de la categoría/i) as HTMLInputElement;
        expect(input.value).toBe('Electrónica');
    });

    it('muestra advertencia de bloqueo si se intenta eliminar una categoría con hijas', async () => {
        renderWithProviders(<AdminCategoriesView />);

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument();
        });

        // Electrónica tiene subcategoría Audio, su botón eliminar debe abrir el modal con advertencia
        const deleteBtns = screen.getAllByRole('button', { name: /Eliminar/i });
        fireEvent.click(deleteBtns[0]);

        expect(screen.getByText(/Acción bloqueada/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Eliminar definitivamente/i })).toBeDisabled();
    });
});
