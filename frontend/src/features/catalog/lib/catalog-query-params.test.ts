import { describe, expect, it } from 'vitest';
import {
    buildCatalogSearchParams,
    getEffectiveSortOrder,
    getPersistedSortParam,
    isFiltrosDefault,
    mapCatalogSortToBackend,
    parseFiltrosFromParams,
    toCatalogApiSearchParams,
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

    describe('mapCatalogSortToBackend', () => {
        it('mapea correctamente los criterios del frontend a Spring Data sort', () => {
            expect(mapCatalogSortToBackend('price-asc')).toBe('precioVenta,asc');
            expect(mapCatalogSortToBackend('price-desc')).toBe('precioVenta,desc');
            expect(mapCatalogSortToBackend('name-asc')).toBe('nombre,asc');
            expect(mapCatalogSortToBackend('name-desc')).toBe('nombre,desc');
            expect(mapCatalogSortToBackend('newest')).toBe('createdAt,desc');
            expect(mapCatalogSortToBackend(null)).toBeNull();
            expect(mapCatalogSortToBackend(undefined)).toBeNull();
        });
    });

    describe('toCatalogApiSearchParams', () => {
        it('convierte parámetros de URL a formato compatible con el backend', () => {
            const urlParams = new URLSearchParams('page=2&sort=price-desc&search=laptop');
            const apiParams = toCatalogApiSearchParams(urlParams);

            expect(apiParams.get('page')).toBe('1'); // Base 0
            expect(apiParams.get('size')).toBe('12'); // Default 12
            expect(apiParams.get('sort')).toBe('precioVenta,desc'); // Mapeado
            expect(apiParams.get('search')).toBe('laptop');
        });

        it('elimina sort si no es válido o no está presente para usar el default del backend', () => {
            const urlParams = new URLSearchParams('page=1');
            const apiParams = toCatalogApiSearchParams(urlParams);

            expect(apiParams.get('page')).toBe('0');
            expect(apiParams.has('sort')).toBe(false);
        });
    });
});
