import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import GuestRoute from './GuestRoute';
import { mockAdminAuthTokenResponse, mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { renderWithProviders } from '@/test/utils/renderWithProviders';

function GuestRoutes() {
    return (
        <Routes>
            <Route path="/profile" element={<h1>Perfil privado</h1>} />
            <Route path="/admin" element={<h1>Panel admin</h1>} />
            <Route
                path="/login"
                element={
                    <GuestRoute>
                        <h1>Iniciar sesión</h1>
                    </GuestRoute>
                }
            />
        </Routes>
    );
}

describe('GuestRoute', () => {
    it('muestra el formulario si no hay sesión', async () => {
        renderWithProviders(<GuestRoutes />, {
            routerProps: { initialEntries: ['/login'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
        });
    });

    it('redirige al perfil si el cliente ya inició sesión', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_CUSTOMER');

        renderWithProviders(<GuestRoutes />, {
            routerProps: { initialEntries: ['/login'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Perfil privado' })).toBeInTheDocument();
        });
    });

    it('redirige al panel admin si el admin ya inició sesión', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');

        renderWithProviders(<GuestRoutes />, {
            routerProps: { initialEntries: ['/login'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Panel admin' })).toBeInTheDocument();
        });
    });
});
