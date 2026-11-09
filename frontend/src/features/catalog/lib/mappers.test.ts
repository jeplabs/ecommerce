import { describe, expect, it } from 'vitest';
import { mapProductApiToCard, mapProductApiToDetail, getProductMainImageUrl } from './mappers';
import { mockProduct } from '@/test/msw/fixtures/products';

describe('mappers (catalog)', () => {
    it('mapea ProductApi a ProductCardView', () => {
        const card = mapProductApiToCard(mockProduct);
        expect(card.id).toBe(mockProduct.id);
        expect(card.sku).toBe(mockProduct.sku);
        expect(card.nombre).toBe(mockProduct.nombre);
        expect(card.precioVenta).toBe(mockProduct.precioVenta);
        expect(card.imagenUrl).toBeDefined();
    });

    it('mapea ProductApi a ProductDetailViewModel', () => {
        const detail = mapProductApiToDetail(mockProduct);
        expect(detail.id).toBe(mockProduct.id);
        expect(detail.descripcion).toBe(mockProduct.descripcion);
        expect(detail.specs).toBeDefined();
        expect(detail.imagenes).toEqual(mockProduct.imagenes);
    });

    it('extrae URL de imagen principal o fallback', () => {
        const mainUrl = getProductMainImageUrl(mockProduct);
        expect(mainUrl).toBe(mockProduct.imagenes?.[0]?.url);

        const withoutImg = { ...mockProduct, imagenes: [] };
        expect(getProductMainImageUrl(withoutImg)).toBe('/images/product-placeholder.svg');
    });
});
