import { describe, expect, it } from 'vitest';
import { getAll, getByCategory, getBySlug } from './productApi';
import {
    mockProduct,
    mockProductAlpha,
    mockProductBeta,
} from '@/test/msw/fixtures/products';

describe('productApi', () => {
    it('getAll devuelve el contenido del catálogo (MSW)', async () => {
        const productos = await getAll();

        expect(productos.length).toBeGreaterThanOrEqual(4);
        expect(productos.some((p) => p.slug === mockProduct.slug)).toBe(true);
    });

    it('getBySlug devuelve producto existente', async () => {
        const producto = await getBySlug(mockProductAlpha.slug);
        expect(producto.nombre).toBe('Auriculares Alpha');
        expect(producto.sku).toBe('AUDIO-001');
    });

    it('getBySlug lanza error si no existe', async () => {
        await expect(getBySlug('slug-inexistente')).rejects.toThrow('Producto no encontrado');
    });

    it('getByCategory filtra por categoría', async () => {
        const page = await getByCategory(2, 0, 10);

        expect(page.content).toHaveLength(2);
        expect(page.content.map((p) => p.slug).sort()).toEqual(
            [mockProductAlpha.slug, mockProductBeta.slug].sort()
        );
    });
});
