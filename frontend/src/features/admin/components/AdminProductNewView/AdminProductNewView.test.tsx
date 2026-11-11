import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicProducts } from '@/test/msw/fixtures/products-registry';
import AdminProductNewView from './AdminProductNewView';

function renderWithProviders(ui: ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/admin/products/new']}>
            <AppProviders>{ui}</AppProviders>
        </MemoryRouter>
    );
}

describe('AdminProductNewView', () => {
    beforeEach(() => {
        resetDynamicProducts();
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
    });

    it('crea un producto nuevo y navega de regreso a /admin/products', async () => {
        const onNavigate = vi.fn();

        renderWithProviders(<AdminProductNewView onNavigate={onNavigate} />);

        expect(screen.getByRole('heading', { name: 'Crear Producto' })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Electrónica' })).toBeInTheDocument();
        });

        fireEvent.change(screen.getByLabelText('Nombre'), {
            target: { value: 'Monitor Studio 27' },
        });
        fireEvent.change(screen.getByLabelText('SKU'), {
            target: { value: 'MON-2700' },
        });
        fireEvent.change(screen.getByLabelText('Descripción'), {
            target: { value: 'Panel IPS 4K calibrado' },
        });
        fireEvent.change(screen.getByLabelText('Precio'), {
            target: { value: '450' },
        });
        fireEvent.change(screen.getByLabelText('Stock'), {
            target: { value: '12' },
        });
        fireEvent.change(screen.getByLabelText('Categoria'), {
            target: { value: '1' },
        });
        fireEvent.change(screen.getByLabelText('Subcategoria'), {
            target: { value: '2' },
        });

        fireEvent.change(screen.getByPlaceholderText('https://ejemplo.com/imagen.jpg'), {
            target: { value: 'https://cdn.example.com/monitor.jpg' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Agregar URL' }));

        fireEvent.click(screen.getByRole('button', { name: 'Agregar Producto' }));

        await waitFor(() => {
            expect(onNavigate).toHaveBeenCalledWith('/admin/products');
        });
    });

    it('navega de regreso al hacer clic en Volver a Productos', async () => {
        const onNavigate = vi.fn();

        renderWithProviders(<AdminProductNewView onNavigate={onNavigate} />);

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Electrónica' })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: /Volver a Productos/i }));
        expect(onNavigate).toHaveBeenCalledWith('/admin/products');
    });
});
