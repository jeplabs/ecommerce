import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { clearAuthTokens, setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse, MOCK_LOGIN_EMAIL } from '@/test/msw/fixtures/auth';
import { resetDynamicUsers } from '@/test/msw/fixtures/users-registry';
import AdminUsersListView from './AdminUsersListView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/users']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminUsersListView', () => {
    beforeEach(() => {
        resetDynamicUsers();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    afterEach(() => {
        clearAuthTokens();
    });

    it('carga la tabla de usuarios y permite desactivar y reactivar un usuario', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderWithProviders(<AdminUsersListView />);

        expect(
            screen.getByRole('heading', { name: 'Gestión de usuarios' })
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(MOCK_LOGIN_EMAIL)).toBeInTheDocument();
        });

        const deactivateButtons = screen.getAllByRole('button', { name: 'Desactivar' });
        fireEvent.click(deactivateButtons[0]!);

        await waitFor(() => {
            expect(screen.getByText('Inactivo')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Activar' }));

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });
});
