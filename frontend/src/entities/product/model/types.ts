import { z } from 'zod';
import { createSpringPageSchema } from '@/shared/api/spring-page';
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

export const productPageSchema = createSpringPageSchema(productApiSchema);
export const productAdminPageSchema = createSpringPageSchema(productAdminApiSchema);

export type ProductPage = import('@/shared/api/spring-page').SpringPage<ProductApi>;
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
