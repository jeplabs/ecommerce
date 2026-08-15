import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { CheckoutProvider } from '@/app/providers/CheckoutProvider';
import { useCheckout } from '@/app/providers';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { addDynamicCartItem } from '@/test/msw/fixtures/cart-registry';
import { mockProduct } from '@/test/msw/fixtures/products';
import {
    MOCK_ORDER_PENDING_ID,
    updateDynamicOrderStatusAdmin,
} from '@/test/msw/fixtures/orders-registry';

const PENDING_ORDER_KEY = 'webpay:ordenPendienteId';

function createCheckoutWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={['/checkout']}>
                <AppProviders>
                    <CheckoutProvider>{children}</CheckoutProvider>
                </AppProviders>
            </MemoryRouter>
        );
    };
}

function seedCustomerSession() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_CUSTOMER');
}

describe('useCheckoutLogic — reanudación del polling (Caso 5)', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('reanuda el polling al montar con una orden pendiente y completa al quedar CONFIRMADA', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);
        sessionStorage.setItem(PENDING_ORDER_KEY, String(MOCK_ORDER_PENDING_ID));

        renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        // El primer tick (INICIADA) no debe tocar el pendiente guardado.
        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(sessionStorage.getItem(PENDING_ORDER_KEY)).toBe(
            String(MOCK_ORDER_PENDING_ID)
        );

        // El pago fue aprobado en el backend mientras el cliente estaba fuera.
        updateDynamicOrderStatusAdmin(MOCK_ORDER_PENDING_ID, 'CONFIRMADA');

        // El siguiente poll (backoff de 2 s) detecta APROBADA → limpia el pendiente.
        await waitFor(
            () => expect(sessionStorage.getItem(PENDING_ORDER_KEY)).toBeNull(),
            { timeout: 5000 }
        );
    });

    it('mantiene la orden pendiente si la transacción sigue INICIADA', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);
        sessionStorage.setItem(PENDING_ORDER_KEY, String(MOCK_ORDER_PENDING_ID));

        renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        // Backoff: tick inmediato + tick a los 2 s, sin cambio de estado.
        await new Promise((resolve) => setTimeout(resolve, 2500));
        expect(sessionStorage.getItem(PENDING_ORDER_KEY)).toBe(
            String(MOCK_ORDER_PENDING_ID)
        );
    });
});
