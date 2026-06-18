import { describe, expect, it } from 'vitest';
import {
    buildCatalogSearchParams,
    getEffectiveSortOrder,
    getPersistedSortParam,
    isFiltrosDefault,
    parseFiltrosFromParams,
} from './catalog-query-params';
import { extractFilterFacets } from './filter-facets';
import { catalogProductsFixture } from '@/test/fixtures/catalog-products';

describe('catalog-query-params', () => {
    const opciones = extractFilterFacets(catalogProductsFixture);

    it('parsea sort desde la URL', () => {
        const params = new URLSearchParams('sort=price-desc');
        expect(getPersistedSortParam(params)).toBe('price-desc');
        expect(getEffectiveSortOrder(params)).toBe('price-desc');
    });

    it('usa price-asc como orden por defecto', () => {
        expect(getEffectiveSortOrder(new URLSearchParams())).toBe('price-asc');
    });

    it('parsea precioMax desde la URL', () => {
        const params = new URLSearchParams('precioMax=80');
        const filtros = parseFiltrosFromParams(params, opciones);

        expect(filtros?.precioMax).toBe(80);
    });

    it('construye params de catálogo con sort y filtros', () => {
        const prev = new URLSearchParams('search=alpha');
        const filtros = parseFiltrosFromParams(new URLSearchParams('precioMax=80'), opciones);

        const next = buildCatalogSearchParams(prev, {
            filtros,
            sort: 'name-asc',
            opciones,
        });

        expect(next.get('sort')).toBe('name-asc');
        expect(next.get('precioMax')).toBe('80');
        expect(next.get('search')).toBe('alpha');
    });

    it('detecta filtros por defecto', () => {
        const filtros = parseFiltrosFromParams(new URLSearchParams('precioMax=80'), opciones);
        expect(isFiltrosDefault(filtros, opciones)).toBe(false);
        expect(isFiltrosDefault(null, opciones)).toBe(true);
    });
});
