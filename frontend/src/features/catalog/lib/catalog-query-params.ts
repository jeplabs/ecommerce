import { createDefaultFiltros, createEmptySpecs } from './filter-facets';
import type { CatalogFilterOpciones, CatalogFiltros, CatalogSortOrder } from '../types';

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

/**
 * Traduce el criterio de ordenamiento del frontend al formato Spring Data `sort`
 * soportado por `GET /api/productos`: `campo,asc` o `campo,desc`.
 */
export function mapCatalogSortToBackend(sort: CatalogSortOrder | null | undefined): string | null {
    switch (sort) {
        case 'price-asc':
            return 'precioVenta,asc';
        case 'price-desc':
            return 'precioVenta,desc';
        case 'name-asc':
            return 'nombre,asc';
        case 'name-desc':
            return 'nombre,desc';
        case 'newest':
            return 'createdAt,desc';
        default:
            return null;
    }
}

/**
 * Convierte los parámetros de navegación de la URL a los parámetros de consulta
 * soportados por el endpoint `GET /api/productos` del backend Spring Data.
 */
export function toCatalogApiSearchParams(searchParams: URLSearchParams): URLSearchParams {
    const apiParams = new URLSearchParams(searchParams);

    // 1. Paginación: URL usa base 1, Spring Data usa base 0
    const rawPage = apiParams.get('page');
    const pageNum = rawPage ? Math.max(1, Number(rawPage)) : 1;
    apiParams.set('page', String(pageNum - 1));

    if (!apiParams.has('size')) {
        apiParams.set('size', '12');
    }

    // 2. Ordenamiento: Mapear 'price-asc' -> 'precioVenta,asc', etc.
    const rawSort = apiParams.get('sort') as CatalogSortOrder | null;
    const backendSort = mapCatalogSortToBackend(rawSort);
    if (backendSort) {
        apiParams.set('sort', backendSort);
    } else {
        apiParams.delete('sort');
    }

    return apiParams;
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

export function getPageParam(searchParams: URLSearchParams | null | undefined): number {
    if (!searchParams) return 1;
    const p = searchParams.get('page');
    const parsed = Number(p);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function buildCatalogSearchParams(
    prevSearchParams: URLSearchParams,
    {
        filtros,
        sort,
        page,
        opciones,
    }: {
        filtros: CatalogFiltros | null;
        sort: CatalogSortOrder | null;
        page?: number;
        opciones: CatalogFilterOpciones;
    }
): URLSearchParams {
    const next = new URLSearchParams(prevSearchParams);
    const { facetKeys } = safeOpciones(opciones);

    clearFilterParams(next, facetKeys);

    if (sort && SORT_VALUES.has(sort)) {
        next.set('sort', sort);
    }

    if (page && page > 1) {
        next.set('page', String(page));
    } else {
        next.delete('page');
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

