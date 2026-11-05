import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutReservationBanner from './CheckoutReservationBanner';
import { CartContext, type CartContextValue } from '@/app/providers/cart-context';
import { ToastContext, type ToastContextValue } from '@/app/providers/toast-context';

function createMockCart(overrides: Partial<CartContextValue> = {}): CartContextValue {
    return {
        items: [{ id: 1, name: 'Prod 1', price: 10, quantity: 1, subtotal: 10, stock: 5 }],
        loading: false,
        error: null,
        cartCount: 1,
        cartTotal: 10,
        isEmpty: false,
        expiracion: {
            expiraAt: new Date(Date.now() + 600000).toISOString(),
            segundosRestantes: 600,
            ttlTotalSegundos: 3600,
            avisoSegundosAntes: 600,
            carritoAnteriorExpirado: false,
        },
        segundosRestantes: 600,
        showExpiredModal: false,
        closeExpiredModal: vi.fn(),
        itemsNoRestaurados: [],
        addToCart: vi.fn(),
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        clearCart: vi.fn(),
        renovarCart: vi.fn().mockResolvedValue({ success: true }),
        restaurarCart: vi.fn().mockResolvedValue({ success: true, itemsNoRestaurados: [] }),
        refreshCart: vi.fn(),
        ...overrides,
    };
}

function createMockToast(): ToastContextValue {
    return {
        toasts: [],
        showToast: vi.fn(),
        showSuccess: vi.fn(),
        showError: vi.fn(),
        showInfo: vi.fn(),
        removeToast: vi.fn(),
    };
}

describe('CheckoutReservationBanner', () => {
    it('retorna null si el carrito está vacío o no hay expiración', () => {
        const cart = createMockCart({ isEmpty: true, items: [] });
        const { container } = render(
            <CartContext.Provider value={cart}>
                <CheckoutReservationBanner />
            </CartContext.Provider>
        );
        expect(container.firstChild).toBeNull();
    });

    it('renderiza el tiempo restante en formato mm:ss', () => {
        const cart = createMockCart({ segundosRestantes: 450 });
        render(
            <CartContext.Provider value={cart}>
                <CheckoutReservationBanner />
            </CartContext.Provider>
        );
        expect(screen.getByText(/07:30/)).toBeInTheDocument();
    });

    it('muestra el botón de extender cuando está en el umbral de advertencia', () => {
        const cart = createMockCart({ segundosRestantes: 300 });
        render(
            <CartContext.Provider value={cart}>
                <CheckoutReservationBanner />
            </CartContext.Provider>
        );
        expect(screen.getByRole('button', { name: /extender/i })).toBeInTheDocument();
    });

    it('llama a renovarCart y muestra toast de éxito al pulsar extender', async () => {
        const cart = createMockCart({ segundosRestantes: 300 });
        const toast = createMockToast();

        render(
            <ToastContext.Provider value={toast}>
                <CartContext.Provider value={cart}>
                    <CheckoutReservationBanner />
                </CartContext.Provider>
            </ToastContext.Provider>
        );

        const btn = screen.getByRole('button', { name: /extender/i });
        fireEvent.click(btn);

        await waitFor(() => {
            expect(cart.renovarCart).toHaveBeenCalledTimes(1);
            expect(toast.showSuccess).toHaveBeenCalledWith('Reserva extendida exitosamente');
        });
    });
});

