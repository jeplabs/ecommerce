import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { useAdminOrdersLogic } from './useAdminOrdersLogic';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { MOCK_ORDER_PENDING_ID } from '@/test/msw/fixtures/orders-registry';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={['/admin/orders']}>
                <AppProviders>{children}</AppProviders>
            </MemoryRouter>
        );
    };
}

function seedAdminToken() {
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('useAdminOrdersLogic', () => {
    it('carga pedidos admin', async () => {
        seedAdminToken();

        const { result } = renderHook(() => useAdminOrdersLogic(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.ordenes.length).toBeGreaterThanOrEqual(3);
        expect(result.current.totalElements).toBeGreaterThanOrEqual(3);
    });

    it('filtra por estado PENDIENTE', async () => {
        seedAdminToken();

        const { result } = renderHook(() => useAdminOrdersLogic(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setEstadoFiltro('PENDIENTE');
        });

        await waitFor(() =>
            expect(result.current.ordenes.every((o) => o.estado === 'PENDIENTE')).toBe(true)
        );
    });

    it('actualiza estado de un pedido pendiente', async () => {
        seedAdminToken();

        const { result } = renderHook(() => useAdminOrdersLogic(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        let updateResult: Awaited<
            ReturnType<typeof result.current.updateEstadoOrden>
        > | undefined;

        await act(async () => {
            updateResult = await result.current.updateEstadoOrden(
                MOCK_ORDER_PENDING_ID,
                'CONFIRMADA'
            );
        });

        expect(updateResult?.success).toBe(true);
        if (updateResult?.success) {
            expect(updateResult.data.estado).toBe('CONFIRMADA');
        }
    });
});
