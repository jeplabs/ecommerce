import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { useCheckoutSuccessRecommendations } from './useCheckoutSuccessRecommendations';
import { mockProduct } from '@/test/msw/fixtures/products';
import {
    findDynamicOrder,
    MOCK_ORDER_PENDING_ID,
} from '@/test/msw/fixtures/orders-registry';

function Wrapper({ children }: { children: ReactNode }) {
    return (
        <MemoryRouter>
            <AppProviders>{children}</AppProviders>
        </MemoryRouter>
    );
}

describe('useCheckoutSuccessRecommendations', () => {
    it('recomienda productos excluyendo los ya pedidos', async () => {
        const orden = findDynamicOrder(MOCK_ORDER_PENDING_ID);
        const { result } = renderHook(
            () => useCheckoutSuccessRecommendations(orden, 12),
            { wrapper: Wrapper }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        const recommendedIds = result.current.recommended.map((p) => p.id);
        expect(recommendedIds).not.toContain(mockProduct.id);
        expect(recommendedIds.length).toBeGreaterThan(0);

        const offerIds = result.current.offers.map((p) => p.id);
        expect(offerIds).not.toContain(mockProduct.id);
    });

    it('funciona sin orden (sugerencias generales)', async () => {
        const { result } = renderHook(() => useCheckoutSuccessRecommendations(null, 4), {
            wrapper: Wrapper,
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.recommended.length).toBeGreaterThan(0);
        expect(result.current.offers).toBeDefined();
    });
});
