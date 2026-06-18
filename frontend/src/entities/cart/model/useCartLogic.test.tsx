import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { useAuth } from '@/app/providers';
import { useCartLogic } from '@/entities/cart';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter>
                <AppProviders>{children}</AppProviders>
            </MemoryRouter>
        );
    };
}

function seedCustomerSession() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_CUSTOMER');
}

describe('useCartLogic', () => {
    it('calcula total y cantidad al agregar productos', async () => {
        seedCustomerSession();

        const { result } = renderHook(() => useCartLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.addToCart(mockProduct.id, 2);
            expect(response.success).toBe(true);
        });

        expect(result.current.cartCount).toBe(2);
        expect(result.current.cartTotal).toBe(mockProduct.precioVenta * 2);
        expect(result.current.isEmpty).toBe(false);
    });

    it('vacía ítems al cerrar sesión', async () => {
        seedCustomerSession();

        const { result } = renderHook(
            () => ({
                auth: useAuth(),
                cart: useCartLogic(),
            }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.auth.loading).toBe(false));
        await waitFor(() => expect(result.current.cart.loading).toBe(false));

        await act(async () => {
            await result.current.cart.addToCart(mockProduct.id, 1);
        });

        expect(result.current.cart.cartCount).toBe(1);

        act(() => {
            result.current.auth.logout();
        });

        await waitFor(() => {
            expect(result.current.cart.cartCount).toBe(0);
            expect(result.current.cart.isEmpty).toBe(true);
        });
    });

    it('devuelve error si falla la API al agregar', async () => {
        seedCustomerSession();

        const { result } = renderHook(() => useCartLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.addToCart(9999, 1);
            expect(response.success).toBe(false);
            if (!response.success) {
                expect(response.error).toBeTruthy();
            }
        });
    });
});
