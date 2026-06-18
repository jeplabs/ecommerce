import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
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
});
