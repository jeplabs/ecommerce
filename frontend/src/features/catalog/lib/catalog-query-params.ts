import { createDefaultFiltros, createEmptySpecs } from './filter-facets';
import type { CatalogFilterOpciones, CatalogFiltros, CatalogSortOrder } from '../model/types';

const SORT_VALUES = new Set<CatalogSortOrder>([
    'price-asc',
    'price-desc',
    'name-asc',
    'name-desc',
    'newest',
]);

function safeOpciones(opciones: CatalogFilterOpciones | null | undefined) {
    return {
        precioMin: opciones?.precioMin ?? 0,
        precioMax: opciones?.precioMax ?? 10000,
        facetKeys: opciones?.facetKeys ?? [],
    };
}

function clearFilterParams(next: URLSearchParams, facetKeys: string[]) {
    next.delete('precioMin');
    next.delete('precioMax');
    next.delete('sort');
    facetKeys.forEach((k) => next.delete(k));
    ['marca', 'ram', 'almacenamiento'].forEach((k) => next.delete(k));
}

export function getPersistedSortParam(
    searchParams: URLSearchParams | null | undefined
): CatalogSortOrder | null {
    if (!searchParams) return null;
    const s = searchParams.get('sort');
    return SORT_VALUES.has(s as CatalogSortOrder) ? (s as CatalogSortOrder) : null;
}

export function getEffectiveSortOrder(
    searchParams: URLSearchParams | null | undefined
): CatalogSortOrder {
    return getPersistedSortParam(searchParams) ?? 'price-asc';
}

export function parseFiltrosFromParams(
    searchParams: URLSearchParams | null | undefined,
    opciones: CatalogFilterOpciones
): CatalogFiltros | null {
    if (!searchParams) return null;

    const { precioMin: defMin, precioMax: defMax, facetKeys } = safeOpciones(opciones);
    const specs = createEmptySpecs(facetKeys);

    let hasSpecFacets = false;

    for (const key of facetKeys) {
        const vals = searchParams.getAll(key);
        if (vals.length > 0) {
            specs[key] = vals;
            hasSpecFacets = true;
        }
    }

    const legacyMarca = searchParams.getAll('marca');
    const legacyRam = searchParams.getAll('ram');
    const legacyStorage = searchParams.getAll('almacenamiento');
    if (legacyMarca.length && facetKeys.includes('Marca')) {
        specs.Marca = [...new Set([...(specs.Marca || []), ...legacyMarca])];
        hasSpecFacets = true;
    }
    if (legacyRam.length && facetKeys.includes('RAM')) {
        specs.RAM = [...new Set([...(specs.RAM || []), ...legacyRam])];
        hasSpecFacets = true;
    }
    if (legacyStorage.length && facetKeys.includes('Almacenamiento')) {
        specs.Almacenamiento = [
            ...new Set([...(specs.Almacenamiento || []), ...legacyStorage]),
        ];
        hasSpecFacets = true;
    }

    const pmRaw = searchParams.get('precioMin');
    const pmaxRaw = searchParams.get('precioMax');

    let precioMin = defMin;
    let precioMax = defMax;
    let precioFromUrl = false;

    if (pmRaw !== null && pmRaw !== '') {
        precioMin = Number(pmRaw);
        precioFromUrl = true;
    }
    if (pmaxRaw !== null && pmaxRaw !== '') {
        precioMax = Number(pmaxRaw);
        precioFromUrl = true;
    }

    if (!hasSpecFacets && !precioFromUrl) return null;

    if (!hasSpecFacets && precioFromUrl && precioMin === defMin && precioMax === defMax) {
        return null;
    }

    return { specs, precioMin, precioMax };
}

export function isFiltrosDefault(
    filtros: CatalogFiltros | null | undefined,
    opciones: CatalogFilterOpciones
): boolean {
    if (!filtros) return true;
    const { precioMin, precioMax, facetKeys } = safeOpciones(opciones);

    for (const key of facetKeys) {
        const selected = filtros.specs?.[key];
        if (selected?.length) return false;
    }

    return filtros.precioMin === precioMin && filtros.precioMax === precioMax;
}

export function buildCatalogSearchParams(
    prevSearchParams: URLSearchParams,
    {
        filtros,
        sort,
        opciones,
    }: {
        filtros: CatalogFiltros | null;
        sort: CatalogSortOrder | null;
        opciones: CatalogFilterOpciones;
    }
): URLSearchParams {
    const next = new URLSearchParams(prevSearchParams);
    const { facetKeys } = safeOpciones(opciones);

    clearFilterParams(next, facetKeys);

    if (sort && SORT_VALUES.has(sort)) {
        next.set('sort', sort);
    }

    const op = safeOpciones(opciones);
    if (!filtros || isFiltrosDefault(filtros, opciones)) {
        return next;
    }

    for (const key of facetKeys) {
        const values = filtros.specs?.[key];
        if (values?.length) {
            values.forEach((v) => next.append(key, v));
        }
    }

    if (filtros.precioMin !== op.precioMin) {
        next.set('precioMin', String(filtros.precioMin));
    }
    if (filtros.precioMax !== op.precioMax) {
        next.set('precioMax', String(filtros.precioMax));
    }

    return next;
}

export { createDefaultFiltros };
