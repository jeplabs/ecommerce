import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProductosByCategory } from './useProductosByCategory';
import * as catalogApi from '../api/catalogApi';
import { mockCategories } from '@/test/msw/fixtures/categories';

vi.mock('@/app/providers', () => ({
    useCategorias: () => ({
        arbolCategorias: mockCategories,
    }),
}));

vi.mock('../api/catalogApi', () => ({
    getCatalogo: vi.fn(),
}));

describe('useProductosByCategory (BPR)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('extrae totalElements y totalPages correctamente de la respuesta paginada del backend', async () => {
        const mockPage = {
            content: [
                { id: 101, nombre: 'Producto 1', precioVenta: 100 },
                { id: 102, nombre: 'Producto 2', precioVenta: 200 },
            ],
            totalPages: 5,
            totalElements: 50,
            number: 0,
            size: 12,
        };

        vi.mocked(catalogApi.getCatalogo).mockResolvedValueOnce(mockPage as any);

        const { result } = renderHook(() =>
            useProductosByCategory('electronica')
        );

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.productos).toHaveLength(2);
        expect(result.current.totalPaginas).toBe(5);
        expect(result.current.totalElementos).toBe(50);
        expect(result.current.error).toBeNull();
    });

    it('devuelve totalElementos 0 si la categoría no existe', async () => {
        const { result } = renderHook(() =>
            useProductosByCategory('categoria-no-existente')
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Categoría no encontrada');
        expect(result.current.productos).toHaveLength(0);
        expect(result.current.totalElementos).toBe(0);
    });
});
