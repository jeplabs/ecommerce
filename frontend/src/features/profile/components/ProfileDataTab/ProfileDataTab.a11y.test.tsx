import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders, ProfileProvider } from '@/app/providers';
import ProfileDataTab from './ProfileDataTab';
import ChangePasswordForm from '../ChangePasswordForm/ChangePasswordForm';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <MemoryRouter initialEntries={['/profile']}>
            <AppProviders>
                <ProfileProvider>{children}</ProfileProvider>
            </AppProviders>
        </MemoryRouter>
    );
}

describe('Accesibilidad — ProfileDataTab y ChangePasswordForm', () => {
    beforeEach(() => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
    });

    it('cumple con WCAG 2.1 AA en modo visualización de datos de perfil', async () => {
        const { container } = render(<ProfileDataTab />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: /información personal/i })).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA en modo edición de datos de perfil', async () => {
        const user = userEvent.setup();
        const { container } = render(<ProfileDataTab />, { wrapper: Wrapper });

        const editButton = await screen.findByRole('button', { name: /editar perfil/i });
        await user.click(editButton);

        expect(screen.getByRole('heading', { level: 3, name: /editar datos/i })).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA cuando el formulario de cambio de contraseña está desplegado', async () => {
        const user = userEvent.setup();
        const { container } = render(<ChangePasswordForm />, { wrapper: Wrapper });

        const openButton = screen.getByRole('button', { name: /cambiar contraseña/i });
        await user.click(openButton);

        expect(screen.getByLabelText(/contraseña actual/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^nueva contraseña/i)).toBeInTheDocument();

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
