import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import AdminUsersListView from './AdminUsersListView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse, MOCK_LOGIN_EMAIL } from '@/test/msw/fixtures/auth';
import { resetDynamicUsers } from '@/test/msw/fixtures/users-registry';

describe('Accesibilidad — AdminUsersListView y AdminUsersTable', () => {
    beforeEach(() => {
        resetDynamicUsers();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('cumple con WCAG 2.1 AA en la gestión de usuarios con tabla y acciones', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/admin/users']}>
                <AppProviders>
                    <AdminUsersListView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { level: 1, name: /gestión de usuarios/i })
            ).toBeInTheDocument();
            expect(screen.getByText(MOCK_LOGIN_EMAIL)).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
