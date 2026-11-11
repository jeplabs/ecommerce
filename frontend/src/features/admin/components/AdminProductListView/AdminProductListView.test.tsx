import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { API_URL } from '@/config';
import { clearAuthTokens, setAccessToken } from '@/lib/auth-token-store';
import { server } from '@/test/msw/server';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';
import { resetDynamicProducts } from '@/test/msw/fixtures/products-registry';
import AdminProductListView from './AdminProductListView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/products']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminProductListView', () => {
    beforeEach(() => {
        resetDynamicProducts();
        setAccessToken(mockAdminAuthTokenResponse.token);
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    afterEach(() => {
        clearAuthTokens();
    });

    it('renderiza la lista paginada desde admin, permite navegar a crear/editar y soporta >100 productos', async () => {
        const onNavigate = vi.fn();

        server.use(
            http.get(`${API_URL}/api/productos/admin`, ({ request }) => {
                const url = new URL(request.url);
                const page = Number(url.searchParams.get('page') ?? 0);
                const size = Number(url.searchParams.get('size') ?? 24);
                const nombre = url.searchParams.get('nombre')?.toLowerCase();
                const categoriaId = url.searchParams.get('categoriaId');
                const estado = url.searchParams.get('estado');

                const dataset = Array.from({ length: 560 }, (_, idx) => ({
                    id: idx + 1,
                    sku: idx === 0 ? mockProduct.sku : `SKU-${idx + 1}`,
                    nombre: idx === 0 ? mockProduct.nombre : `Producto ${idx + 1}`,
                    slug: `producto-${idx + 1}`,
                    stock: 10,
                    estado: (idx === 1 ? 'OCULTO' : 'DISPONIBLE') as 'DISPONIBLE' | 'OCULTO',
                    precioVenta: 99.99,
                    precioCosto: 50,
                    margenPorcentaje: 50,
                    moneda: 'USD',
                    imagenes: [],
                    createdAt: '2026-05-01T10:00:00',
                    categoryIds: idx < 5 ? [1, 2] : [1],
                }));

                const filtered = dataset.filter((item) => {
                    if (estado && item.estado !== estado) return false;
                    if (categoriaId && !item.categoryIds.includes(Number(categoriaId))) return false;
                    if (
                        nombre &&
                        !item.nombre.toLowerCase().includes(nombre) &&
                        !item.sku.toLowerCase().includes(nombre)
                    ) {
                        return false;
                    }
                    return true;
                });

                const start = page * size;
                return HttpResponse.json({
                    content: filtered.slice(start, start + size).map(({ categoryIds: _c, ...rest }) => rest),
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

        renderWithProviders(<AdminProductListView onNavigate={onNavigate} />);

        await waitFor(() => {
            expect(screen.getByText('560 productos registrados')).toBeInTheDocument();
        });

        expect(screen.getByText(mockProduct.nombre)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '2' } });
        await waitFor(() => {
            expect(screen.getByText('5 productos registrados')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Buscar producto'), {
            target: { value: mockProduct.sku },
        });
        await waitFor(() => {
            expect(screen.getByText('1 producto registrado')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
        await waitFor(() => {
            expect(screen.getByText('560 productos registrados')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Agregar Producto' }));
        expect(onNavigate).toHaveBeenCalledWith('/admin/products/new');

        const editButtons = screen.getAllByRole('button', { name: /Editar/i });
        fireEvent.click(editButtons[0]!);
        expect(onNavigate).toHaveBeenCalledWith('/admin/products/edit/1');
    });

    it('elimina un producto tras confirmar en el diálogo', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderWithProviders(<AdminProductListView onNavigate={vi.fn()} />);

        await waitFor(() => {
            expect(screen.getByText(mockProduct.nombre)).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
        fireEvent.click(deleteButtons[0]!);

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalled();
            expect(screen.getByText('Producto desactivado exitosamente')).toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });
});
