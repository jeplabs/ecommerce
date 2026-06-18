import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import { mockAdminAuthTokenResponse, mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { renderWithProviders } from '@/test/utils/renderWithProviders';

function AuthRoutes({ requiredRol }: { requiredRol?: 'ROLE_ADMIN' | 'ROLE_CUSTOMER' }) {
    return (
        <Routes>
            <Route path="/login" element={<h1>Iniciar sesión</h1>} />
            <Route path="/admin" element={<h1>Panel admin</h1>} />
            <Route path="/profile" element={<h1>Perfil privado</h1>} />
            <Route
                path="/secure"
                element={
                    <PrivateRoute requiredRol={requiredRol}>
                        <h1>Contenido protegido</h1>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

describe('PrivateRoute', () => {
    it('redirige a login si no hay sesión', async () => {
        renderWithProviders(<AuthRoutes requiredRol="ROLE_CUSTOMER" />, {
            routerProps: { initialEntries: ['/secure'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
        });
    });

    it('muestra contenido con rol correcto', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_CUSTOMER');

        renderWithProviders(<AuthRoutes requiredRol="ROLE_CUSTOMER" />, {
            routerProps: { initialEntries: ['/secure'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Contenido protegido' })).toBeInTheDocument();
        });
    });

    it('redirige al admin si un cliente intenta acceder a ruta de admin', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_CUSTOMER');

        renderWithProviders(<AuthRoutes requiredRol="ROLE_ADMIN" />, {
            routerProps: { initialEntries: ['/secure'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Perfil privado' })).toBeInTheDocument();
        });
    });

    it('redirige al panel admin si un admin intenta ruta de cliente', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');

        renderWithProviders(<AuthRoutes requiredRol="ROLE_CUSTOMER" />, {
            routerProps: { initialEntries: ['/secure'] },
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Panel admin' })).toBeInTheDocument();
        });
    });
});
