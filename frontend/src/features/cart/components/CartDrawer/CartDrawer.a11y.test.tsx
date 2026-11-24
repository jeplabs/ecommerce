import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import CartDrawer from './CartDrawer';

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
    useAuth: () => ({ isAuthenticated: true }),
    useToast: () => ({ showSuccess: vi.fn(), showError: vi.fn() }),
    useCart: () => ({
        items: mockCartItems,
        cartTotal: 2400,
        cartCount: 2,
        isEmpty: false,
        loading: false,
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        expiracion: null,
        segundosRestantes: null,
    }),
}));

describe('Accesibilidad — CartDrawer (Paso 4: Carrito y Checkout)', () => {
    it('el drawer con productos cumple con las normas de accesibilidad de axe-core', async () => {
        const { container } = render(
            <MemoryRouter>
                <CartDrawer isOpen={true} onClose={vi.fn()} />
            </MemoryRouter>
        );

        const results = await axe(container);

        expect(results).toHaveNoViolations();
    });
});
