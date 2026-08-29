import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { useFavoritesLogic } from './useFavoritesLogic';
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

describe('useFavoritesLogic', () => {
    it('toggleFavorite agrega y quita productos', async () => {
        seedCustomerSession();

        const { result } = renderHook(() => useFavoritesLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.favorites).toHaveLength(0));

        await act(async () => {
            const added = await result.current.toggleFavorite(mockProduct);
            expect(added.success).toBe(true);
            if (added.success) {
                expect(added.added).toBe(true);
            }
        });

        expect(result.current.isFavorite(mockProduct.id)).toBe(true);

        await act(async () => {
            await result.current.removeFavorite(mockProduct.id);
        });

        expect(result.current.isFavorite(mockProduct.id)).toBe(false);
    });

    it('requiere autenticación para toggle', async () => {
        const { result } = renderHook(() => useFavoritesLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.favorites).toHaveLength(0));

        let toggleResult: Awaited<ReturnType<typeof result.current.toggleFavorite>> | undefined;

        await act(async () => {
            toggleResult = await result.current.toggleFavorite(mockProduct);
        });

        expect(toggleResult?.success).toBe(false);
        if (toggleResult && !toggleResult.success) {
            expect('requiresAuth' in toggleResult).toBe(true);
        }
    });
});
