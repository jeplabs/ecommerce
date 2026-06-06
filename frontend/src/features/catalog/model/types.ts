import type { ProductApi } from '@/entities/product';

export type CatalogSortOrder =
    | 'price-asc'
    | 'price-desc'
    | 'name-asc'
    | 'name-desc'
    | 'newest';

export type SpecFacetOption = {
    matchValue: string;
    displayLabel: string;
};

export type CatalogFilterOpciones = {
    specFacets: Record<string, SpecFacetOption[]>;
    facetKeys: string[];
    precioMin: number;
    precioMax: number;
};

export type CatalogFiltros = {
    specs: Record<string, string[]>;
    precioMin: number;
    precioMax: number;
};

/** Producto en catálogo; `marca` legacy en algunos listados. */
export type CatalogProduct = ProductApi & { marca?: string };

export type UseProductFilterFormParams = {
    filtros: CatalogFiltros;
    opciones: CatalogFilterOpciones;
    onFilterChange: (next: CatalogFiltros) => void;
};
