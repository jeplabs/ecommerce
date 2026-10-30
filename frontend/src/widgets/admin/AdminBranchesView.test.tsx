import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminBranchesView from './AdminBranchesView';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicBranches } from '@/test/msw/fixtures/branches-registry';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/sucursales']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

function seedAdminToken() {
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('AdminBranchesView', () => {
    beforeEach(() => {
        resetDynamicBranches();
        seedAdminToken();
    });

    it('renderiza el título, estadísticas y la lista de sucursales', async () => {
        renderWithProviders(<AdminBranchesView />);

        expect(screen.getByRole('heading', { name: /Sucursales de retiro/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /\+ Nueva sucursal/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Tienda Centro')).toBeInTheDocument();
            expect(screen.getByText('Tienda Zona 10')).toBeInTheDocument();
        });

        expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    });

    it('abre el modal para crear sucursal al pulsar el botón', async () => {
        renderWithProviders(<AdminBranchesView />);

        await waitFor(() => {
            expect(screen.getByText('Tienda Centro')).toBeInTheDocument();
        });

        const newBtn = screen.getByRole('button', { name: /\+ Nueva sucursal/i });
        fireEvent.click(newBtn);

        expect(screen.getByRole('heading', { name: /Nueva sucursal de retiro/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre de la sucursal/i)).toBeInTheDocument();

        // Cerrar modal
        const closeBtn = screen.getByRole('button', { name: /Cerrar modal/i });
        fireEvent.click(closeBtn);

        expect(screen.queryByRole('heading', { name: /Nueva sucursal de retiro/i })).not.toBeInTheDocument();
    });

    it('abre el modal en modo edición al pulsar Editar', async () => {
        renderWithProviders(<AdminBranchesView />);

        await waitFor(() => {
            expect(screen.getByText('Tienda Centro')).toBeInTheDocument();
        });

        const editBtn = screen.getByRole('button', { name: /Editar Tienda Centro/i });
        fireEvent.click(editBtn);

        expect(screen.getByRole('heading', { name: /Editar sucursal/i })).toBeInTheDocument();
        const inputNombre = screen.getByLabelText(/Nombre de la sucursal/i) as HTMLInputElement;
        expect(inputNombre.value).toBe('Tienda Centro');
    });
});

