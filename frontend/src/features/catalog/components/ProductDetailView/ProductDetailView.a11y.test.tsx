import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ProductDetailView } from './ProductDetailView';
import { mockProduct } from '@/test/msw/fixtures/products';
import { mockCategories } from '@/test/msw/fixtures/categories';

vi.mock('@/app/providers', () => ({
    useCategorias: () => ({
        arbolCategorias: mockCategories,
    }),
    useCart: () => ({
        addToCart: vi.fn(),
    }),
    useAuth: () => ({
        isAuthenticated: true,
    }),
    useToast: () => ({
        showSuccess: vi.fn(),
        showError: vi.fn(),
    }),
    useFavorites: () => ({
        isFavorite: () => false,
        toggleFavorite: vi.fn(),
    }),
}));

vi.mock('../../hooks/useProductDetail', () => ({
    useProductDetail: (slug: string) => ({
        producto: slug === 'not-found' ? null : mockProduct,
        loading: false,
        reload: vi.fn(),
    }),
}));

describe('Accesibilidad — ProductDetailView (Paso 3: Detalle de Producto)', () => {
    it('la vista detallada completa del producto cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <ProductDetailView slug={mockProduct.slug} onBackHome={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('la vista de producto no encontrado cumple con las normas de accesibilidad', async () => {
        const { container } = render(
            <MemoryRouter>
                <ProductDetailView slug="not-found" onBackHome={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
