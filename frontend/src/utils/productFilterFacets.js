/** Parámetros de URL reservados (no son claves de especificación). */
export const RESERVED_FILTER_PARAMS = new Set(['sort', 'search', 'precioMin', 'precioMax']);

export function normalizeSpecDisplay(value) {
    if (value == null || value === '') return '';
    return String(value).trim().replace(/\s+/g, ' ');
}

/** Valor normalizado para comparar en filtros y URL. */
export function normalizeSpecMatch(value) {
    return normalizeSpecDisplay(value).replace(/\s/g, '');
}

/**
 * Extrae facetas dinámicas desde `productos[].specs` del catálogo o categoría actual.
 * Solo el rango de precio es fijo; el resto depende de los productos visibles.
 */
export function extractFilterFacets(productos) {
    if (!productos?.length) {
        return {
            specFacets: {},
            facetKeys: [],
            precioMin: 0,
            precioMax: 10000,
        };
    }

    const facetMaps = {};
    let precioMin = Infinity;
    let precioMax = -Infinity;

    const addFacetValue = (key, raw) => {
        const displayLabel = normalizeSpecDisplay(raw);
        const matchValue = normalizeSpecMatch(raw);
        if (!matchValue) return;
        if (!facetMaps[key]) facetMaps[key] = new Map();
        if (!facetMaps[key].has(matchValue)) {
            facetMaps[key].set(matchValue, displayLabel);
        }
    };

    for (const prod of productos) {
        if (prod.specs && typeof prod.specs === 'object') {
            for (const [key, raw] of Object.entries(prod.specs)) {
                addFacetValue(key, raw);
            }
        }
        if (prod.marca) {
            addFacetValue('Marca', prod.marca);
        }
        if (prod.precioVenta != null && !Number.isNaN(Number(prod.precioVenta))) {
            const price = Number(prod.precioVenta);
            precioMin = Math.min(precioMin, price);
            precioMax = Math.max(precioMax, price);
        }
    }

    const facetKeys = Object.keys(facetMaps).sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' })
    );

    const specFacets = {};
    for (const key of facetKeys) {
        specFacets[key] = Array.from(facetMaps[key].entries())
            .sort((a, b) => a[1].localeCompare(b[1], 'es', { sensitivity: 'base' }))
            .map(([matchValue, displayLabel]) => ({ matchValue, displayLabel }));
    }

    return {
        specFacets,
        facetKeys,
        precioMin: precioMin === Infinity ? 0 : precioMin,
        precioMax: precioMax === -Infinity ? 10000 : precioMax,
    };
}

export function createEmptySpecs(facetKeys) {
    return Object.fromEntries((facetKeys || []).map((key) => [key, []]));
}

export function createDefaultFiltros(opciones) {
    return {
        specs: createEmptySpecs(opciones?.facetKeys),
        precioMin: opciones?.precioMin ?? 0,
        precioMax: opciones?.precioMax ?? 10000,
    };
}

export function mergeFiltrosWithFacets(filtros, opciones) {
    const base = createDefaultFiltros(opciones);
    if (!filtros) return base;
    const specs = { ...base.specs };
    for (const key of opciones?.facetKeys || []) {
        specs[key] = Array.isArray(filtros.specs?.[key]) ? [...filtros.specs[key]] : [];
    }
    return {
        specs,
        precioMin: filtros.precioMin ?? base.precioMin,
        precioMax: filtros.precioMax ?? base.precioMax,
    };
}

export function productMatchesSpecs(producto, specs) {
    if (!specs) return true;
    for (const [key, selected] of Object.entries(specs)) {
        if (!selected?.length) continue;
        const raw =
            producto.specs?.[key] ?? (key === 'Marca' ? producto.marca : undefined);
        const match = normalizeSpecMatch(raw);
        if (!match || !selected.includes(match)) return false;
    }
    return true;
}

export function applyProductFilters(productos, filtros, searchTerm = '') {
    if (!productos?.length) return [];

    let resultado = [...productos];

    if (filtros) {
        const { precioMin, precioMax, specs } = filtros;
        resultado = resultado.filter((p) => {
            const price = Number(p.precioVenta) || 0;
            if (price < precioMin || price > precioMax) return false;
            return productMatchesSpecs(p, specs);
        });
    }

    const term = searchTerm?.trim();
    if (term) {
        const lower = term.toLowerCase();
        resultado = resultado.filter((p) => p.nombre?.toLowerCase().includes(lower));
    }

    return resultado;
}

export function countActiveFilters(filtros, opciones) {
    if (!filtros) return 0;
    let count = 0;
    for (const values of Object.values(filtros.specs || {})) {
        count += values?.length ?? 0;
    }
    const defMin = opciones?.precioMin ?? 0;
    const defMax = opciones?.precioMax ?? 10000;
    if (filtros.precioMin !== defMin) count += 1;
    if (filtros.precioMax !== defMax) count += 1;
    return count;
}
