import { describe, expect, it } from 'vitest';
import { getMainProductImageUrl, getProductImageUrls } from './product-images';
import { mapProductApiToCard } from './mappers';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/assets/product-placeholder';

describe('product-images & mappers fallback (BPR)', () => {
    it('retorna arreglo vacío si el producto no tiene imágenes', () => {
        expect(getProductImageUrls(null)).toEqual([]);
        expect(getProductImageUrls({ imagenes: [] })).toEqual([]);
    });

    it('retorna la constante PRODUCT_PLACEHOLDER_IMAGE en getMainProductImageUrl cuando no hay imágenes', () => {
        expect(getMainProductImageUrl(null)).toBe(PRODUCT_PLACEHOLDER_IMAGE);
        expect(getMainProductImageUrl({ imagenes: [] })).toBe(PRODUCT_PLACEHOLDER_IMAGE);
    });

    it('asigna el placeholder en mapProductApiToCard cuando el producto no tiene imágenes', () => {
        const mockProduct = {
            id: 1,
            sku: 'SKU1',
            nombre: 'Producto Sin Imagen',
            slug: 'producto-sin-imagen',
            precioVenta: 100,
            moneda: 'CLP',
            estado: 'DISPONIBLE' as const,
            stock: 10,
            imagenes: [],
            createdAt: '2026-01-01T00:00:00',
            categorias: [],
        };
        const card = mapProductApiToCard(mockProduct);
        expect(card.imagenUrl).toBe(PRODUCT_PLACEHOLDER_IMAGE);
    });
});
