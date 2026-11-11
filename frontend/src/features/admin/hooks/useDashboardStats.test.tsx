import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_URL } from '@/config';
import { server } from '@/test/msw/server';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...mod,
        useNavigate: () => navigateMock,
    };
});

import { authApi } from '@/features/auth';
import { useDashboardStats } from './useDashboardStats';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <MemoryRouter>{children}</MemoryRouter>;
    };
}

describe('useDashboardStats', () => {
    beforeEach(() => {
        localStorage.clear();
        navigateMock.mockReset();
        vi.restoreAllMocks();
    });

    it('redirige a /login si no hay token', async () => {
        renderHook(() => useDashboardStats(), { wrapper: createWrapper() });

        await waitFor(() =>
            expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true })
        );
    });

    it('agrega métricas de usuarios, productos, órdenes y revenue', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');

        const { result } = renderHook(() => useDashboardStats(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeNull();
        expect(result.current.totalUsuarios).toBeGreaterThanOrEqual(2);
        expect(result.current.productosDisponibles).toBeGreaterThanOrEqual(1);
        expect(result.current.totalOrdenes).toBeGreaterThanOrEqual(3);
        expect(result.current.revenueTotal).toBeGreaterThan(0);
        expect(result.current.ticketPromedio).toBeGreaterThan(0);
        expect(result.current.ultimasOrdenes.length).toBeLessThanOrEqual(5);
    });

    it('reporta error si falla la consulta de métricas', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(authApi, 'listUsuarios').mockRejectedValueOnce(
            new Error('Fallo en dashboard')
        );

        const { result } = renderHook(() => useDashboardStats(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe('Fallo en dashboard');
        consoleSpy.mockRestore();
    });

    it('reporta el total real de productos (totalElements) sin tope de 100', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');

        server.use(
            http.get(`${API_URL}/api/productos/admin`, ({ request }) => {
                const url = new URL(request.url);
                const estado = url.searchParams.get('estado');
                const totalElements = estado === 'OCULTO' ? 18 : 560;
                return HttpResponse.json({
                    content: [],
                    totalElements,
                    totalPages: totalElements,
                    size: 1,
                    number: 0,
                    first: true,
                    last: false,
                    empty: true,
                    numberOfElements: 0,
                });
            })
        );

        const { result } = renderHook(() => useDashboardStats(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.productosDisponibles).toBe(560);
        expect(result.current.productosOcultos).toBe(18);
    });
});
