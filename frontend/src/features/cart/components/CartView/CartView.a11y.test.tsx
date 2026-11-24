import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import CartView from './CartView';

const mockCartItems = [
    {
        id: 1,
        slug: 'laptop-pro',
        name: 'Laptop Pro 16',
        price: 1200,
        quantity: 2,
        imageUrl: '/img/laptop.jpg',
        altText: 'Laptop Pro 16',
    },
];

vi.mock('@/app/providers', () => ({
    useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
    useCart: () => ({
        items: mockCartItems,
        cartTotal: 2400,
        isEmpty: false,
        loading: false,
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        expiracion: null,
        segundosRestantes: null,
    }),
}));

describe('Accesibilidad — CartView (Paso 4: Carrito y Checkout)', () => {
    it('la tabla completa de productos en el carrito cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <CartView onProceedToCheckout={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
