import { describe, expect, it } from 'vitest';
import {
    applyProductFilters,
    createDefaultFiltros,
    extractFilterFacets,
    mergeFiltrosWithFacets,
    normalizeSpecMatch,
    productMatchesSpecs,
} from './filter-facets';
import { catalogProductsFixture } from '@/test/fixtures/catalog-products';

describe('filter-facets', () => {
    it('extrae facetas de precio y marca desde productos', () => {
        const opciones = extractFilterFacets(catalogProductsFixture);

        expect(opciones.facetKeys).toContain('Marca');
        expect(opciones.precioMin).toBe(49.99);
        expect(opciones.precioMax).toBe(199.99);
        expect(opciones.specFacets.Marca?.length).toBeGreaterThan(0);
    });

    it('crea filtros por defecto alineados con las opciones', () => {
        const opciones = extractFilterFacets(catalogProductsFixture);
        const filtros = createDefaultFiltros(opciones);

        expect(filtros.precioMin).toBe(49.99);
        expect(filtros.precioMax).toBe(199.99);
        expect(filtros.specs.Marca).toEqual([]);
    });

    it('filtra por rango de precio', () => {
        const opciones = extractFilterFacets(catalogProductsFixture);
        const filtros = mergeFiltrosWithFacets(
            { ...createDefaultFiltros(opciones), precioMin: 45, precioMax: 55 },
            opciones
        );

        const resultado = applyProductFilters(catalogProductsFixture, filtros);
        expect(resultado.map((p) => p.nombre)).toEqual(['Auriculares Alpha']);
    });

    it('filtra por especificación Marca', () => {
        const opciones = extractFilterFacets(catalogProductsFixture);
        const filtros = mergeFiltrosWithFacets(createDefaultFiltros(opciones), opciones);
        filtros.specs.Marca = [normalizeSpecMatch('Sony')];

        const resultado = applyProductFilters(catalogProductsFixture, filtros);
        expect(resultado).toHaveLength(1);
        expect(resultado[0]?.nombre).toBe('Auriculares Alpha');
    });

    it('filtra por término de búsqueda en el nombre', () => {
        const resultado = applyProductFilters(catalogProductsFixture, null, 'zebra');
        expect(resultado).toHaveLength(1);
        expect(resultado[0]?.nombre).toBe('Parlante Zebra');
    });

    it('productMatchesSpecs exige coincidencia cuando hay valores seleccionados', () => {
        const producto = catalogProductsFixture[2];
        expect(
            productMatchesSpecs(producto, { Marca: [normalizeSpecMatch('Sony')] })
        ).toBe(true);
        expect(
            productMatchesSpecs(producto, { Marca: [normalizeSpecMatch('Samsung')] })
        ).toBe(false);
    });
});
