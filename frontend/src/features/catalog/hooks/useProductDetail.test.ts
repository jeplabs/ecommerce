import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProductDetail } from './useProductDetail';
import * as productsApi from '../api/productsApi';
import { mockProduct } from '@/test/msw/fixtures/products';

const mockUpsert = vi.fn();

vi.mock('@/app/providers', () => ({
    useProduct: () => ({
        upsertProduct: mockUpsert,
    }),
}));

vi.mock('../api/productsApi', () => ({
    getBySlug: vi.fn(),
    getById: vi.fn(),
}));

describe('useProductDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('carga el producto por slug y lo almacena con upsertProduct', async () => {
        vi.mocked(productsApi.getBySlug).mockResolvedValueOnce(mockProduct as any);

        const { result } = renderHook(() => useProductDetail('auriculares-pro'));

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.producto?.nombre).toBe(mockProduct.nombre);
        expect(mockUpsert).toHaveBeenCalledWith(mockProduct);
    });

    it('hace fallback a getById si el slug es numérico y getBySlug falla', async () => {
        vi.mocked(productsApi.getBySlug).mockRejectedValueOnce(new Error('Not found'));
        vi.mocked(productsApi.getById).mockResolvedValueOnce(mockProduct as any);

        const { result } = renderHook(() => useProductDetail('42'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(productsApi.getById).toHaveBeenCalledWith(42);
        expect(result.current.producto?.id).toBe(mockProduct.id);
    });

    it('maneja error cuando el producto no existe', async () => {
        vi.mocked(productsApi.getBySlug).mockRejectedValueOnce(new Error('Not found'));

        const { result } = renderHook(() => useProductDetail('no-existe'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.producto).toBeNull();
    });
});
