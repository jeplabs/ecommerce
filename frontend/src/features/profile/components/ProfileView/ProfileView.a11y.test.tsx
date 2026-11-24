import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import ProfileView from './ProfileView';
import { setAccessToken } from '@/lib/auth-token-store';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';

describe('Accesibilidad — ProfileView', () => {
    beforeEach(() => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
    });

    it('cumple con WCAG 2.1 AA en la vista principal de perfil', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/profile']}>
                <AppProviders>
                    <ProfileView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1, name: /mi cuenta/i })).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('cumple con WCAG 2.1 AA al navegar a la pestaña de direcciones', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/profile/direcciones']}>
                <AppProviders>
                    <ProfileView />
                </AppProviders>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 2, name: /mis direcciones/i })).toBeInTheDocument();
        });

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
