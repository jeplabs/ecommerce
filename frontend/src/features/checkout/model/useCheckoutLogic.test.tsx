import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { CheckoutProvider } from '@/app/providers/CheckoutProvider';
import { useCheckout } from '@/app/providers';
import { PAYMENT_METHODS } from '@/features/checkout';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { addDynamicCartItem } from '@/test/msw/fixtures/cart-registry';
import { mockAddresses } from '@/test/msw/fixtures/addresses';
import { mockProduct } from '@/test/msw/fixtures/products';

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

describe('useCheckoutLogic', () => {
    it('selecciona dirección principal y habilita continuar', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await waitFor(() => expect(result.current.loadingAddresses).toBe(false));
        await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

        expect(result.current.selectedAddressId).toBe(mockAddresses[0]?.id);
        expect(result.current.currentStep).toBe('pedido');
    });

    it('avanza al paso de pago', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

        act(() => {
            result.current.goNext();
        });

        expect(result.current.currentStep).toBe('pago');
    });

    it('requiere tarjeta completa para pagar con Stripe', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

        act(() => {
            result.current.goNext();
        });

        expect(result.current.canContinuePayment).toBe(false);

        act(() => {
            result.current.updateCardField('cardholder', 'Test User');
            result.current.updateCardField('cardNumber', '4242 4242 4242 4242');
            result.current.updateCardField('expiry', '12/30');
            result.current.updateCardField('cvc', '123');
        });

        expect(result.current.canContinuePayment).toBe(true);
    });

    it('mantiene el mismo costo de envío en paso 1 y paso 2 para contraentrega', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

        act(() => {
            result.current.setPaymentMethod(PAYMENT_METHODS.CONTRA_ENTREGA);
        });

        expect(result.current.currentStep).toBe('pedido');
        expect(result.current.shippingCostInTotal).toBe(5.99);

        act(() => {
            result.current.goNext();
        });

        expect(result.current.currentStep).toBe('pago');
        expect(result.current.shippingCostInTotal).toBe(5.99);
    });

    it('completa checkout con contraentrega sin pasar por la pasarela simulada', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

        act(() => {
            result.current.goNext();
            result.current.setPaymentMethod(PAYMENT_METHODS.CONTRA_ENTREGA);
        });

        expect(result.current.canContinuePayment).toBe(true);
        expect(result.current.formaPagoEnvio).toBe(result.current.FORMA_PAGO_ENVIO.CONTRA_ENTREGA);

        let checkoutResult: Awaited<ReturnType<typeof result.current.completeCheckout>> | undefined;

        await act(async () => {
            checkoutResult = await result.current.completeCheckout();
        });

        expect(checkoutResult?.success).toBe(true);
        if (checkoutResult?.success) {
            expect(checkoutResult.orden.formaPagoEnvio).toBe('CONTRA_ENTREGA');
            expect(checkoutResult.payment).toBeNull();
        }
    });

    it('completa checkout con transferencia bancaria', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

        act(() => {
            result.current.goNext();
            result.current.setPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER);
        });

        expect(result.current.canContinuePayment).toBe(true);

        let checkoutResult: Awaited<ReturnType<typeof result.current.completeCheckout>> | undefined;

        await act(async () => {
            checkoutResult = await result.current.completeCheckout();
        });

        expect(checkoutResult?.success).toBe(true);
        if (checkoutResult?.success) {
            expect(checkoutResult.isBankTransfer).toBe(true);
            expect(checkoutResult.orden.items.length).toBeGreaterThan(0);
        }
    });
});
