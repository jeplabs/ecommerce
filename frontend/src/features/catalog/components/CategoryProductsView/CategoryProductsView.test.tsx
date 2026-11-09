import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CategoryProductsView } from './CategoryProductsView';
import { mockCategories } from '@/test/msw/fixtures/categories';
import { mockProduct } from '@/test/msw/fixtures/products';

vi.mock('@/app/providers', () => ({
    useCategorias: () => ({
        arbolCategorias: mockCategories,
    }),
}));

vi.mock('../../hooks/useProductosByCategory', () => ({
    useProductosByCategory: () => ({
        productos: [mockProduct],
        facets: undefined,
        loading: false,
        error: null,
        paginaActual: 1,
        setPaginaActual: vi.fn(),
        totalPaginas: 1,
        totalElementos: 1,
    }),
}));

vi.mock('../ProductCatalog/ProductCatalog', () => ({
    ProductCatalog: () => <div data-testid="category-product-catalog">Category Product Catalog Mock</div>,
}));

describe('CategoryProductsView (BPR)', () => {
    it('renderiza título de categoría y grilla de productos', () => {
        render(
            <MemoryRouter>
                <CategoryProductsView slugPath="electronica/audio" segmentos={['electronica', 'audio']} />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Audio' })).toBeInTheDocument();
        expect(screen.getByTestId('category-product-catalog')).toBeInTheDocument();
    });
});
