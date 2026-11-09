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
});
