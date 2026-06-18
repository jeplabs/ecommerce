import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrdenesLogic } from './useOrdenesLogic';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import {
    MOCK_ORDER_PENDING_ID,
    MOCK_ORDER_SHIPPED_ID,
} from '@/test/msw/fixtures/orders-registry';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <MemoryRouter initialEntries={['/profile/ordenes']}>{children}</MemoryRouter>;
    };
}

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_CUSTOMER');
}

describe('useOrdenesLogic', () => {
    it('carga la lista de pedidos', async () => {
        seedAuth();

        const { result } = renderHook(() => useOrdenesLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.ordenes.length).toBeGreaterThanOrEqual(3);
        expect(result.current.obtenerDetalleLocal(MOCK_ORDER_PENDING_ID)?.estado).toBe('PENDIENTE');
    });

    it('obtiene detalle desde la lista sin llamada extra', async () => {
        seedAuth();

        const { result } = renderHook(() => useOrdenesLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        let detailResult: Awaited<ReturnType<typeof result.current.cargarDetalle>> | undefined;

        await act(async () => {
            detailResult = await result.current.cargarDetalle(MOCK_ORDER_PENDING_ID);
        });

        expect(detailResult?.success).toBe(true);
        if (detailResult?.success) {
            expect(detailResult.data?.id).toBe(MOCK_ORDER_PENDING_ID);
        }
    });

    it('cancela un pedido pendiente', async () => {
        seedAuth();

        const { result } = renderHook(() => useOrdenesLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        let cancelResult: Awaited<ReturnType<typeof result.current.cancelarOrden>> | undefined;

        await act(async () => {
            cancelResult = await result.current.cancelarOrden(MOCK_ORDER_PENDING_ID);
        });

        expect(cancelResult?.success).toBe(true);
        if (cancelResult?.success) {
            expect(cancelResult.data?.estado).toBe('CANCELADA');
        }
    });

    it('no cancela pedidos enviados', async () => {
        seedAuth();

        const { result } = renderHook(() => useOrdenesLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        let cancelResult: Awaited<ReturnType<typeof result.current.cancelarOrden>> | undefined;

        await act(async () => {
            cancelResult = await result.current.cancelarOrden(MOCK_ORDER_SHIPPED_ID);
        });

        expect(cancelResult?.success).toBe(false);
    });
});
