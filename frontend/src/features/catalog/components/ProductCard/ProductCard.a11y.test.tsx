import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from './ProductCard';
import { mockProduct } from '@/test/msw/fixtures/products';

vi.mock('@/app/providers', () => ({
    useAuth: () => ({ isAuthenticated: true }),
    useFavorites: () => ({
        isFavorite: (id: number) => id === mockProduct.id,
        toggleFavorite: vi.fn(),
    }),
    useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
}));

describe('Accesibilidad — ProductCard (Paso 2: Catálogo y Búsqueda)', () => {
    it('cumple con las normas de accesibilidad de axe-core con producto disponible', async () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard
                    product={mockProduct}
                    imageSrc="/img/laptop.jpg"
                    title="Laptop Pro 16"
                    description="Potente laptop para desarrollo"
                    price={1200}
                    stock={10}
                    onAddToCart={vi.fn()}
                    onAction={vi.fn()}
                    showFavorite={true}
                />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });

    it('cumple con las normas de accesibilidad cuando el producto está agotado', async () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard
                    product={mockProduct}
                    imageSrc="/img/laptop.jpg"
                    title="Laptop Pro 16"
                    description="Potente laptop para desarrollo"
                    price={1200}
                    stock={0}
                    onAddToCart={vi.fn()}
                    onAction={vi.fn()}
                    showFavorite={true}
                />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
