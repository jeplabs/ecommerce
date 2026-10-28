import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders, ProfileProvider } from '@/app/providers';
import ProfileDataTab from './ProfileDataTab';
import { setAccessToken } from '@/shared/lib/auth-token-store';
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

describe('ProfileDataTab — Seguridad de la sesión', () => {
    beforeEach(() => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
    });

    it('renderiza la sección de seguridad de sesión al final con su descripción y botón', async () => {
        render(<ProfileDataTab />, { wrapper: Wrapper });

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 3, name: /seguridad de la sesión/i })).toBeInTheDocument();
        });

        expect(
            screen.getByText(/puedes revocar y cerrar todas tus sesiones activas/i)
        ).toBeInTheDocument();

        expect(
            screen.getByRole('button', { name: /cerrar sesión en todos los dispositivos/i })
        ).toBeInTheDocument();
    });

    it('no cierra sesión si el usuario cancela la confirmación en el diálogo', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(<ProfileDataTab />, { wrapper: Wrapper });

        const btn = await screen.findByRole('button', {
            name: /cerrar sesión en todos los dispositivos/i,
        });

        await user.click(btn);

        expect(confirmSpy).toHaveBeenCalled();
        expect(
            screen.getByRole('button', { name: /cerrar sesión en todos los dispositivos/i })
        ).toBeInTheDocument();

        confirmSpy.mockRestore();
    });

    it('cierra todas las sesiones si el usuario confirma en el diálogo', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<ProfileDataTab />, { wrapper: Wrapper });

        const btn = await screen.findByRole('button', {
            name: /cerrar sesión en todos los dispositivos/i,
        });

        await user.click(btn);

        expect(confirmSpy).toHaveBeenCalled();

        await waitFor(() => {
            expect(
                screen.getByText(/has cerrado sesión en todos los dispositivos/i)
            ).toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });
});

