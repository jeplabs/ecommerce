import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { mockAdminAuthTokenResponse, MOCK_LOGIN_EMAIL } from '@/test/msw/fixtures/auth';
import { resetDynamicUsers } from '@/test/msw/fixtures/users-registry';
import AdminUserEditView from './AdminUserEditView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/users/1/edit']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminUserEditView', () => {
    beforeEach(() => {
        resetDynamicUsers();
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('carga el usuario por ID y permite actualizar su rol', async () => {
        renderWithProviders(<AdminUserEditView userId={1} />);

        expect(screen.getByText('Cargando usuario…')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Editar usuario' })).toBeInTheDocument();
        });

        expect(screen.getByText(MOCK_LOGIN_EMAIL)).toBeInTheDocument();

        const submitButton = screen.getByRole('button', { name: 'Guardar rol' });
        expect(submitButton).toBeDisabled();

        const roleSelect = screen.getByLabelText('Rol en el sistema') as HTMLSelectElement;
        fireEvent.change(roleSelect, { target: { value: 'ROLE_ADMIN' } });

        expect(submitButton).not.toBeDisabled();
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Rol actualizado')).toBeInTheDocument();
        });
    });

    it('muestra error amigable si el usuario no existe', async () => {
        renderWithProviders(<AdminUserEditView userId={99999} />);

        await waitFor(() => {
            expect(screen.getAllByText(/Usuario no encontrado/i).length).toBeGreaterThan(0);
        });
    });
});
