import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductCatalog } from './ProductCatalog';
import * as catalogApi from '../../api/catalogApi';
import { mockProduct } from '@/test/msw/fixtures/products';

vi.mock('@/app/providers', () => ({
    useAuth: () => ({ isAuthenticated: true }),
    useCart: () => ({ addToCart: vi.fn().mockResolvedValue({ success: true }) }),
    useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
    useFavorites: () => ({
        isFavorite: vi.fn().mockReturnValue(false),
        toggleFavorite: vi.fn().mockResolvedValue({ success: true, added: true }),
    }),
}));

vi.mock('../../api/catalogApi', () => ({
    getCatalogo: vi.fn(),
    invalidateCatalogoCache: vi.fn(),
}));

describe('ProductCatalog (BPR)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza productos cargados desde el servidor', async () => {
        vi.mocked(catalogApi.getCatalogo).mockResolvedValueOnce({
            content: [mockProduct],
            totalPages: 1,
            totalElements: 1,
            size: 12,
            number: 0,
        });

        render(
            <MemoryRouter>
                <ProductCatalog />
            </MemoryRouter>
        );

        expect(screen.getByText('Cargando productos...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(mockProduct.nombre)).toBeInTheDocument();
        });

        expect(screen.getByText(/Productos \(1\)/i)).toBeInTheDocument();
    });

    it('renderiza productos externos si se proporcionan por props', () => {
        render(
            <MemoryRouter>
                <ProductCatalog
                    productosExternos={[mockProduct]}
                    totalElementosExterno={1}
                    totalPaginasExterno={1}
                />
            </MemoryRouter>
        );

        expect(screen.getByText(mockProduct.nombre)).toBeInTheDocument();
        expect(catalogApi.getCatalogo).not.toHaveBeenCalled();
    });

    it('envía los parámetros de ordenamiento traducidos al backend (server-side sort)', async () => {
        vi.mocked(catalogApi.getCatalogo).mockResolvedValueOnce({
            content: [mockProduct],
            totalPages: 1,
            totalElements: 1,
            size: 12,
            number: 1,
        });

        render(
            <MemoryRouter initialEntries={['/catalogo?sort=price-desc&page=2']}>
                <ProductCatalog />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(catalogApi.getCatalogo).toHaveBeenCalledTimes(1);
        });

        const calledParams = vi.mocked(catalogApi.getCatalogo).mock.calls[0]![0] as URLSearchParams;
        expect(calledParams.get('sort')).toBe('precioVenta,desc');
        expect(calledParams.get('page')).toBe('1'); // Base 0 (page 2 - 1)
        expect(calledParams.get('size')).toBe('12');
    });

    it('renderiza productos en el orden provisto por el servidor sin reordenar en memoria', async () => {
        const prodA = { ...mockProduct, id: 1, nombre: 'Producto A', precioVenta: 100 };
        const prodB = { ...mockProduct, id: 2, nombre: 'Producto B', precioVenta: 10 };

        // El backend devuelve prodA antes de prodB a pesar de que el precio de B es menor
        vi.mocked(catalogApi.getCatalogo).mockResolvedValueOnce({
            content: [prodA, prodB],
            totalPages: 1,
            totalElements: 2,
            size: 12,
            number: 0,
        });

        render(
            <MemoryRouter initialEntries={['/catalogo?sort=price-asc']}>
                <ProductCatalog />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Producto A')).toBeInTheDocument();
        });

        const titulos = screen
            .getAllByRole('heading', { level: 3 })
            .map((h) => h.textContent)
            .filter((t) => t !== 'Filtros');
        expect(titulos).toEqual(['Producto A', 'Producto B']);
    });
});
