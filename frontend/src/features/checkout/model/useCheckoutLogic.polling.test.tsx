import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { CheckoutProvider } from '@/app/providers/CheckoutProvider';
import { useCheckout } from '@/app/providers';
import { PAYMENT_METHODS } from '@/features/checkout';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { addDynamicCartItem } from '@/test/msw/fixtures/cart-registry';
import { mockProduct } from '@/test/msw/fixtures/products';
import { WEBPAY_POLL_BACKOFF_MS } from './useCheckoutLogic';

const consultarEstadoSpy = vi.hoisted(() => ({ consultarEstadoWebpay: vi.fn() }));

vi.mock('@/features/checkout/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/features/checkout/api')>();
    return {
        ...actual,
        consultarEstadoWebpay: consultarEstadoSpy.consultarEstadoWebpay,
    };
});

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

async function selectNormalDelivery(result: { current: ReturnType<typeof useCheckout> }) {
    await waitFor(() => expect(result.current.loadingAddresses).toBe(false));
    await waitFor(() => expect(result.current.loadingEnvioOpciones).toBe(false));

    act(() => {
        const normal = result.current.deliveryServices[0];
        if (normal) result.current.setSelectedServicioEnvioId(normal.id);
    });
}

async function prepararCheckoutWebpay(result: { current: ReturnType<typeof useCheckout> }) {
    await selectNormalDelivery(result);

    await waitFor(() => expect(result.current.canContinueShipping).toBe(true));

    act(() => {
        result.current.goNext();
        result.current.setPaymentMethod(PAYMENT_METHODS.WEBPAY);
    });
}

describe('useCheckoutLogic polling Webpay', () => {
    beforeEach(() => {
        consultarEstadoSpy.consultarEstadoWebpay.mockReset();
        consultarEstadoSpy.consultarEstadoWebpay.mockResolvedValue({
            ordenId: 501,
            estado: 'INICIADA',
            motivo: null,
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('usa backoff incremental: el primer tick es inmediato y los siguientes usan WEBPAY_POLL_BACKOFF_MS', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await prepararCheckoutWebpay(result);

        vi.useFakeTimers();

        await act(async () => {
            await result.current.completeCheckout();
        });

        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(1);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[0]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(2);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[1]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(3);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[2]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(4);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[3]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(5);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[3]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(6);
    });

    it('pausa el polling cuando la pestaña se oculta y consulta al instante al volver', async () => {
        seedCustomerSession();
        addDynamicCartItem(mockProduct.id, 1);

        const { result } = renderHook(() => useCheckout(), {
            wrapper: createCheckoutWrapper(),
        });

        await prepararCheckoutWebpay(result);

        vi.useFakeTimers();

        await act(async () => {
            await result.current.completeCheckout();
        });

        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(1);

        let hidden = false;
        Object.defineProperty(document, 'hidden', {
            configurable: true,
            get: () => hidden,
        });

        hidden = true;
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[0] + WEBPAY_POLL_BACKOFF_MS[1]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(1);

        hidden = false;
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });
        await act(async () => {
            await Promise.resolve();
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(2);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(WEBPAY_POLL_BACKOFF_MS[0]);
        });
        expect(consultarEstadoSpy.consultarEstadoWebpay).toHaveBeenCalledTimes(3);
    });
});
