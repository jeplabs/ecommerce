import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
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

describe('ProductCard (BPR)', () => {
    it('muestra badge y deshabilita agregar cuando no hay stock', () => {
        const onAddToCart = vi.fn();

        render(
            <ProductCard
                imageSrc="/img.png"
                title="Producto agotado"
                price={50}
                stock={0}
                onAddToCart={onAddToCart}
            />
        );

        expect(screen.getByRole('button', { name: 'Producto agotado agotado' })).toBeDisabled();
        expect(screen.getAllByText('Agotado').length).toBeGreaterThanOrEqual(1);
    });

    it('permite agregar al carrito cuando hay stock', async () => {
        const user = userEvent.setup();
        const onAddToCart = vi.fn();

        render(
            <ProductCard
                imageSrc="/img.png"
                title="Producto disponible"
                price={99}
                stock={5}
                onAddToCart={onAddToCart}
            />
        );

        await user.click(screen.getByRole('button', { name: /agregar producto disponible/i }));
        expect(onAddToCart).toHaveBeenCalledOnce();
    });

    it('renderiza botón de favoritos cuando se proporciona product y showFavorite es true', () => {
        render(
            <MemoryRouter>
                <ProductCard
                    product={mockProduct}
                    imageSrc="/img.png"
                    title={mockProduct.nombre}
                    price={mockProduct.precioVenta}
                    stock={mockProduct.stock}
                    showFavorite={true}
                />
            </MemoryRouter>
        );

        expect(screen.getByRole('button', { name: /quitar de favoritos/i })).toBeInTheDocument();
    });

    it('no renderiza botón de favoritos cuando showFavorite es false', () => {
        render(
            <MemoryRouter>
                <ProductCard
                    product={mockProduct}
                    imageSrc="/img.png"
                    title={mockProduct.nombre}
                    price={mockProduct.precioVenta}
                    stock={mockProduct.stock}
                    showFavorite={false}
                />
            </MemoryRouter>
        );

        expect(screen.queryByRole('button', { name: /favoritos/i })).not.toBeInTheDocument();
    });
});
