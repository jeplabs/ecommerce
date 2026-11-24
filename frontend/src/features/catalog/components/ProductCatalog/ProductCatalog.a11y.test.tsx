import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProductCatalog } from './ProductCatalog';
import * as catalogApi from '../../api/catalogApi';
import { mockCatalogProducts } from '@/test/fixtures/catalog-products';

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

describe('Accesibilidad — ProductCatalog (Paso 2: Catálogo y Búsqueda)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(catalogApi.getCatalogo).mockResolvedValue({
            content: mockCatalogProducts,
            totalPages: 2,
            totalElements: mockCatalogProducts.length * 2,
            size: 12,
            number: 0,
        });
    });

    it('el catálogo con productos, ordenamiento y paginación cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/catalogo?page=1']}>
                <ProductCatalog
                    productosExternos={mockCatalogProducts}
                    totalPaginasExterno={2}
                    totalElementosExterno={mockCatalogProducts.length * 2}
                />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('el catálogo en estado vacío no produce violaciones de accesibilidad', async () => {
        const { container } = render(
            <MemoryRouter initialEntries={['/catalogo']}>
                <ProductCatalog
                    productosExternos={[]}
                    totalPaginasExterno={1}
                    totalElementosExterno={0}
                />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
