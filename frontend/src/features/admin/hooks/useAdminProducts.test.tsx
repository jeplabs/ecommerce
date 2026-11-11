import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { API_URL } from '@/config';
import { server } from '@/test/msw/server';
import { clearAuthTokens, setAccessToken } from '@/lib/auth-token-store';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicProducts } from '@/test/msw/fixtures/products-registry';
import { useAdminProducts } from './useAdminProducts';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={['/admin/products']}>
                <AppProviders>{children}</AppProviders>
            </MemoryRouter>
        );
    };
}

describe('useAdminProducts', () => {
    beforeEach(() => {
        resetDynamicProducts();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    afterEach(() => {
        clearAuthTokens();
    });

    it('soporta más de 100 productos mediante paginación real del servidor', async () => {
        server.use(
            http.get(`${API_URL}/api/productos/admin`, ({ request }) => {
                const url = new URL(request.url);
                const page = Number(url.searchParams.get('page') ?? 0);
                const size = Number(url.searchParams.get('size') ?? 24);
                const nombre = url.searchParams.get('nombre')?.toLowerCase();
                const categoriaId = url.searchParams.get('categoriaId');

                const allItems = Array.from({ length: 560 }, (_, idx) => ({
                    id: idx + 1,
                    sku: `SKU-${String(idx + 1).padStart(4, '0')}`,
                    nombre: `Producto Catálogo ${idx + 1}`,
                    slug: `producto-catalogo-${idx + 1}`,
                    stock: 5,
                    estado: 'DISPONIBLE' as const,
                    precioVenta: 25,
                    precioCosto: 15,
                    margenPorcentaje: 40,
                    moneda: 'USD',
                    imagenes: [],
                    createdAt: '2026-05-01T10:00:00',
                    categorias: idx < 30 ? [2] : [1],
                }));

                const filtered = allItems.filter((item) => {
                    if (
                        nombre &&
                        !item.nombre.toLowerCase().includes(nombre) &&
                        !item.sku.toLowerCase().includes(nombre)
                    ) {
                        return false;
                    }
                    if (categoriaId && !item.categorias.includes(Number(categoriaId))) {
                        return false;
                    }
                    return true;
                });

                const start = page * size;
                return HttpResponse.json({
                    content: filtered.slice(start, start + size).map(({ categorias: _c, ...rest }) => rest),
                    totalElements: filtered.length,
                    totalPages: Math.max(1, Math.ceil(filtered.length / size)),
                    size,
                    number: page,
                    first: page === 0,
                    last: start + size >= filtered.length,
                    empty: filtered.length === 0,
                    numberOfElements: filtered.slice(start, start + size).length,
                });
            })
        );

        const { result } = renderHook(() => useAdminProducts(24), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.totalElements).toBe(560);
        expect(result.current.totalPages).toBe(24);
        expect(result.current.productos).toHaveLength(24);

        act(() => {
            result.current.setPage(2);
        });

        await waitFor(() => {
            expect(result.current.productos[0]?.sku).toBe('SKU-0025');
        });

        act(() => {
            result.current.setCategoriaId(2);
        });

        await waitFor(() => {
            expect(result.current.page).toBe(1);
            expect(result.current.totalElements).toBe(30);
        });

        act(() => {
            result.current.setSearchQuery('SKU-0010');
        });

        await waitFor(() => {
            expect(result.current.totalElements).toBe(1);
            expect(result.current.productos[0]?.sku).toBe('SKU-0010');
        });

        act(() => {
            result.current.clearFilters();
        });

        await waitFor(() => {
            expect(result.current.totalElements).toBe(560);
            expect(result.current.hasActiveFilters).toBe(false);
        });
    });

    it('filtra por estado en el servidor usando getAdminPage', async () => {
        const { result } = renderHook(() => useAdminProducts(12), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        const totalInicial = result.current.totalElements;
        expect(totalInicial).toBeGreaterThan(0);

        act(() => {
            result.current.setEstadoFiltro('OCULTO');
        });

        await waitFor(() => {
            expect(result.current.totalElements).toBe(0);
            expect(result.current.hasActiveFilters).toBe(true);
        });
    });
});
