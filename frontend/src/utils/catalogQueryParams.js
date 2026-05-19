/** Query params compartidos entre /catalogo y /categoria/... para filtros y orden. */

import { createDefaultFiltros, createEmptySpecs } from './productFilterFacets';

const SORT_VALUES = new Set(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest']);

function safeOpciones(opciones) {
    return {
        precioMin: opciones?.precioMin ?? 0,
        precioMax: opciones?.precioMax ?? 10000,
        facetKeys: opciones?.facetKeys ?? [],
    };
}

function clearFilterParams(next, facetKeys) {
    next.delete('precioMin');
    next.delete('precioMax');
    next.delete('sort');
    (facetKeys || []).forEach((k) => next.delete(k));
    ['marca', 'ram', 'almacenamiento'].forEach((k) => next.delete(k));
}

/** Valor explícito en la URL (null si no hay `sort` o es inválido). */
export function getPersistedSortParam(searchParams) {
    if (!searchParams) return null;
    const s = searchParams.get('sort');
    return SORT_VALUES.has(s) ? s : null;
}

/** Orden aplicado a la lista: sin param en URL → precio ascendente. */
export function getEffectiveSortOrder(searchParams) {
    return getPersistedSortParam(searchParams) ?? 'price-asc';
}

export function parseFiltrosFromParams(searchParams, opciones) {
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

    /* URLs legacy */
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

export function isFiltrosDefault(filtros, opciones) {
    if (!filtros) return true;
    const { precioMin, precioMax, facetKeys } = safeOpciones(opciones);

    for (const key of facetKeys) {
        const selected = filtros.specs?.[key];
        if (selected?.length > 0) return false;
    }

    return filtros.precioMin === precioMin && filtros.precioMax === precioMax;
}

/**
 * @param {URLSearchParams} prevSearchParams
 * @param {{ filtros: object | null, sort: string | null | undefined, opciones: object }} config
 */
export function buildCatalogSearchParams(prevSearchParams, { filtros, sort, opciones }) {
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
