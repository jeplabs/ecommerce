import { z } from 'zod';
import {
    createSpringPageSchema,
    normalizeSpringPageRaw,
    type SpringPage,
} from '@/shared/api/spring-page';
import {
    productApiSchema,
    productAdminApiSchema,
    type ProductApi,
    type ProductAdminApi,
} from './product';

export const facetOptionSchema = z.object({
    matchValue: z.string(),
    displayLabel: z.string(),
    count: z.number(),
    selected: z.boolean().optional(),
});

export type FacetOptionApi = z.infer<typeof facetOptionSchema>;

export const productPageSchema = z.preprocess(
    normalizeSpringPageRaw,
    z.object({
        content: z.array(productApiSchema),
        totalElements: z.coerce.number().int().nonnegative(),
        totalPages: z.coerce.number().int().nonnegative(),
        size: z.coerce.number().int().nonnegative(),
        number: z.coerce.number().int().nonnegative(),
        first: z.boolean().optional(),
        last: z.boolean().optional(),
        empty: z.boolean().optional(),
        numberOfElements: z.coerce.number().int().nonnegative().optional(),
        facets: z.record(z.string(), z.array(facetOptionSchema)).optional(),
    })
);

export const productAdminPageSchema = createSpringPageSchema(productAdminApiSchema);

export type ProductPage = SpringPage<ProductApi> & {
    facets?: Record<string, FacetOptionApi[]>;
};

export type ProductAdminPage = SpringPage<ProductAdminApi>;

export type CatalogSortOrder =
    | 'price-asc'
    | 'price-desc'
    | 'name-asc'
    | 'name-desc'
    | 'newest';

export type SpecFacetOption = {
    matchValue: string;
    displayLabel: string;
    count?: number;
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
