import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { API_URL } from '@/config';
import { server } from '@/test/msw/server';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';
import { resetDynamicProducts } from '@/test/msw/fixtures/products-registry';
import AdminProductEditView from './AdminProductEditView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/products/edit/1']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminProductEditView', () => {
    beforeEach(() => {
        resetDynamicProducts();
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('carga el producto existente y permite actualizar sus datos', async () => {
        const onNavigate = vi.fn();

        renderWithProviders(<AdminProductEditView productId="1" onNavigate={onNavigate} />);

        expect(screen.getByText('Cargando producto...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Editar Producto' })).toBeInTheDocument();
        });

        const nameInput = screen.getByLabelText('Nombre') as HTMLInputElement;
        await waitFor(() => {
            expect(nameInput.value).toBe(mockProduct.nombre);
            expect(screen.getByRole('option', { name: 'Electrónica' })).toBeInTheDocument();
        });

        fireEvent.change(nameInput, { target: { value: 'Producto Editado' } });
        fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Subcategoria'), { target: { value: '2' } });

        fireEvent.click(screen.getByRole('button', { name: 'Actualizar Producto' }));

        await waitFor(() => {
            expect(onNavigate).toHaveBeenCalledWith('/admin/products');
        });
    });

    it('muestra estado de error si el producto no existe y permite volver a la lista', async () => {
        const onNavigate = vi.fn();

        renderWithProviders(<AdminProductEditView productId="99999" onNavigate={onNavigate} />);

        await waitFor(() => {
            expect(screen.getByText('Error al cargar producto')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: 'Volver a la lista' }));
        expect(onNavigate).toHaveBeenCalledWith('/admin/products');
    });

    it('permite pasar un producto a OCULTO sin errores intermedios ni consultas al endpoint público de imágenes', async () => {
        const onNavigate = vi.fn();
        let imagesEndpointHit = false;

        server.use(
            http.get(`${API_URL}/api/productos/:id/imagenes`, () => {
                imagesEndpointHit = true;
                return HttpResponse.json({ message: 'Producto no encontrado' }, { status: 400 });
            })
        );

        renderWithProviders(<AdminProductEditView productId="1" onNavigate={onNavigate} />);

        const nameInput = (await screen.findByLabelText('Nombre')) as HTMLInputElement;
        await waitFor(() => {
            expect(nameInput.value).toBe(mockProduct.nombre);
            expect(screen.getByRole('option', { name: 'Electrónica' })).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'oculto' } });
        fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText('Subcategoria'), { target: { value: '2' } });

        fireEvent.click(screen.getByRole('button', { name: 'Actualizar Producto' }));

        await waitFor(() => {
            expect(onNavigate).toHaveBeenCalledWith('/admin/products');
        });
        expect(imagesEndpointHit).toBe(false);
    });

    it('carga y permite editar un producto ya OCULTO aunque el endpoint público falle y admin no devuelva categorías', async () => {
        const onNavigate = vi.fn();
        let patchedBody: Record<string, unknown> | null = null;
        let statusBody: Record<string, unknown> | null = null;

        server.use(
            http.get(`${API_URL}/api/productos/77`, () =>
                HttpResponse.json({ message: 'Producto no encontrado con ID: 77' }, { status: 400 })
            ),
            http.get(`${API_URL}/api/productos/77/imagenes`, () =>
                HttpResponse.json({ message: 'Producto no encontrado con ID: 77' }, { status: 400 })
            ),
            http.get(`${API_URL}/api/productos/admin/77`, () =>
                HttpResponse.json({
                    id: 77,
                    sku: 'OCULTO-77',
                    nombre: 'Producto Oculto Prueba',
                    slug: 'producto-oculto-prueba',
                    stock: 5,
                    estado: 'OCULTO',
                    precioVenta: 120,
                    precioCosto: 80,
                    margenPorcentaje: 50,
                    moneda: 'USD',
                    imagenes: [
                        {
                            id: 901,
                            url: 'https://placehold.co/400x400/png',
                            principal: true,
                        },
                    ],
                    createdAt: '2026-05-01T10:00:00',
                })
            ),
            http.patch(`${API_URL}/api/productos/77`, async ({ request }) => {
                patchedBody = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({
                    ...mockProduct,
                    id: 77,
                    sku: 'OCULTO-77',
                    nombre: String(patchedBody.nombre ?? 'Producto Oculto Prueba'),
                    estado: 'OCULTO',
                });
            }),
            http.patch(`${API_URL}/api/productos/77/precio`, () =>
                HttpResponse.json({ error: 'ignored' }, { status: 200 })
            ),
            http.patch(`${API_URL}/api/productos/77/estado`, async ({ request }) => {
                statusBody = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json({ id: 77, estado: statusBody.estado });
            })
        );

        renderWithProviders(<AdminProductEditView productId="77" onNavigate={onNavigate} />);

        const nameInput = (await screen.findByLabelText('Nombre')) as HTMLInputElement;
        await waitFor(() => {
            expect(nameInput.value).toBe('Producto Oculto Prueba');
        });

        expect(screen.getByRole('status')).toHaveTextContent(
            /Este producto no es público actualmente/i
        );

        fireEvent.change(nameInput, { target: { value: 'Producto Oculto Reactivado' } });
        fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'disponible' } });
        fireEvent.click(screen.getByRole('button', { name: 'Actualizar Producto' }));

        await waitFor(() => {
            expect(onNavigate).toHaveBeenCalledWith('/admin/products');
        });

        expect(patchedBody).toMatchObject({ nombre: 'Producto Oculto Reactivado' });
        expect(patchedBody).not.toHaveProperty('categoriaIds');
        expect(statusBody).toEqual({ estado: 'DISPONIBLE' });
    });
});
