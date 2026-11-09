import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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

describe('ProductDetailView (BPR)', () => {
    it('renderiza breadcrumbs, galería, información y pestañas del producto', () => {
        render(
            <MemoryRouter>
                <ProductDetailView slug={mockProduct.slug} onBackHome={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { level: 1, name: mockProduct.nombre })).toBeInTheDocument();
        expect(screen.getByText('Descripción Detallada')).toBeInTheDocument();
        expect(screen.getByText('Características Técnicas')).toBeInTheDocument();
    });

    it('muestra mensaje de producto no encontrado y botón de volver', () => {
        render(
            <MemoryRouter>
                <ProductDetailView slug="not-found" onBackHome={vi.fn()} />
            </MemoryRouter>
        );

        expect(screen.getByText('Producto no encontrado')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /volver al inicio/i })).toBeInTheDocument();
    });
});
