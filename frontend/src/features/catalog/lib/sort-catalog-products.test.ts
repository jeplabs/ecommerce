import { describe, expect, it } from 'vitest';
import { sortCatalogProducts } from './sort-catalog-products';
import { catalogProductsFixture } from '@/test/fixtures/catalog-products';

describe('sortCatalogProducts', () => {
    it('ordena por precio ascendente', () => {
        const sorted = sortCatalogProducts(catalogProductsFixture, 'price-asc');
        expect(sorted[0]?.precioVenta).toBe(49.99);
        expect(sorted.at(-1)?.precioVenta).toBe(199.99);
    });

    it('ordena por precio descendente', () => {
        const sorted = sortCatalogProducts(catalogProductsFixture, 'price-desc');
        expect(sorted[0]?.precioVenta).toBe(199.99);
        expect(sorted.at(-1)?.precioVenta).toBe(49.99);
    });

    it('ordena por nombre A-Z', () => {
        const sorted = sortCatalogProducts(catalogProductsFixture, 'name-asc');
        expect(sorted[0]?.nombre).toBe('Auriculares Alpha');
        expect(sorted.at(-1)?.nombre).toBe('Producto de prueba');
    });

    it('ordena por más reciente', () => {
        const sorted = sortCatalogProducts(catalogProductsFixture, 'newest');
        expect(sorted[0]?.nombre).toBe('Auriculares Alpha');
    });
});
