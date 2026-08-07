import { describe, expect, it } from 'vitest';
import { pickPostCheckoutProducts } from './checkout-recommendations';
import { mockProduct, mockSoldOutProduct } from '@/test/msw/fixtures/products';
import type { ProductApi } from '@/entities/product';

describe('pickPostCheckoutProducts', () => {
    it('devuelve [] sin productos o con lista vacía', () => {
        expect(pickPostCheckoutProducts(null, [])).toEqual([]);
        expect(pickPostCheckoutProducts(undefined, [])).toEqual([]);
        expect(pickPostCheckoutProducts([], [])).toEqual([]);
    });

    it('excluye los productos ya pedidos', () => {
        const items = [{ id: 1, productoId: mockProduct.id }];
        const result = pickPostCheckoutProducts(
            [mockProduct, mockSoldOutProduct],
            items as never
        );
        expect(result.find((p) => p.id === mockProduct.id)).toBeUndefined();
        expect(result.some((p) => p.id === mockSoldOutProduct.id)).toBe(true);
    });

    it('excluye productos OCULTO y DESCONTINUADO (normalizando espacios/guiones)', () => {
        const oculto = { ...mockProduct, id: 10, estado: 'oculto' } as ProductApi;
        const desc = { ...mockProduct, id: 11, estado: 'DESCONTINUADO' } as ProductApi;
        const activo = { ...mockProduct, id: 12, estado: 'DISPONIBLE' } as ProductApi;
        const result = pickPostCheckoutProducts([oculto, desc, activo], []);
        expect(result.map((p) => p.id)).toEqual([activo.id]);
    });

    it('aplica el límite', () => {
        const productos = Array.from({ length: 5 }, (_, i) => ({
            ...mockProduct,
            id: i + 100,
        }));
        const result = pickPostCheckoutProducts(productos, [], 2);
        expect(result.length).toBe(2);
    });

    it('devuelve [] si no quedan candidatos', () => {
        expect(pickPostCheckoutProducts([mockProduct], [{ id: 1, productoId: mockProduct.id }] as never, 12)).toEqual([]);
    });
});
