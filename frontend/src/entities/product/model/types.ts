import { z } from 'zod';
import { createSpringPageSchema, normalizeSpringPageRaw } from '@/shared/api/spring-page';
import {
    productApiSchema,
    productAdminApiSchema,
    productImageApiSchema,
    productStatusSchema,
} from './schemas/api';

export type ProductApi = z.infer<typeof productApiSchema>;
export type ProductAdminApi = z.infer<typeof productAdminApiSchema>;
export type ProductImageApi = z.infer<typeof productImageApiSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;

export type {
    CreateProductRequest,
    UpdateProductRequest,
    UpdateProductStatusRequest,
    AddProductImagesRequest,
    ProductAdminFormValues,
} from './schemas/forms';

export {
    productStatusSchema,
    productApiSchema,
    productAdminApiSchema,
    productImageApiSchema,
} from './schemas/api';
export {
    createProductRequestSchema,
    updateProductRequestSchema,
    updateProductStatusRequestSchema,
    addProductImagesRequestSchema,
    productAdminFormSchema,
    mapProductAdminFormToCreateRequest,
} from './schemas/forms';

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

export type ProductPage = import('@/shared/api/spring-page').SpringPage<ProductApi> & {
    facets?: Record<string, FacetOptionApi[]>;
};
export type ProductAdminPage = import('@/shared/api/spring-page').SpringPage<ProductAdminApi>;

/** Props de UI — view model desacoplado del JSON del API. */
export type ProductCardView = {
    id: number;
    sku: string;
    nombre: string;
    slug: string;
    precioVenta: number;
    moneda: string;
    imagenUrl: string | null;
    estado: ProductStatus;
    stock: number;
};

export type ProductDetailView = ProductCardView & {
    descripcion: string | null;
    specs: Record<string, unknown> | null;
    imagenes: ProductImageApi[];
    categorias: ProductApi['categorias'];
};

export type ProductListFilters = {
    categoriaId?: number;
    page?: number;
    size?: number;
};

export type ProductMutationResult =
    | { success: true }
    | { success: false; message: string };

export type ProductImagesMutationResult =
    | { success: true; data: ProductImageApi[] }
    | { success: false; message: string };
