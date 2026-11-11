import { z } from 'zod';
import {
    localDateTimeSchema,
    moneySchema,
    nullableStringSchema,
    positiveIntSchema,
} from '@/utils/zod-helpers';
import { categoryApiSchema, type CategoryApi } from './category';

/** Alineado a {@code EstadoProducto} del backend. */
export const productStatusSchema = z.enum([
    'DISPONIBLE',
    'SIN_STOCK',
    'OCULTO',
    'DESCONTINUADO',
]);

export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productImageApiSchema = z.object({
    id: positiveIntSchema,
    url: z.string().url(),
    principal: z.boolean(),
});

export type ProductImageApi = z.infer<typeof productImageApiSchema>;

/** {@code DatosRespuestaProducto} — catálogo público. */
export const productApiSchema = z.object({
    id: positiveIntSchema,
    sku: z.string(),
    nombre: z.string(),
    slug: z.string(),
    descripcion: nullableStringSchema,
    specs: z.record(z.string(), z.unknown()).nullable().optional(),
    stock: z.number().int(),
    estado: productStatusSchema,
    precioVenta: moneySchema,
    moneda: z.string(),
    imagenes: z.array(productImageApiSchema).default([]),
    categorias: z.array(categoryApiSchema).default([]),
    createdAt: localDateTimeSchema,
    updatedAt: localDateTimeSchema.optional(),
});

export type ProductApi = z.infer<typeof productApiSchema>;

/** {@code DatosRespuestaProductoAdmin}. */
export const productAdminApiSchema = z.object({
    id: positiveIntSchema,
    sku: z.string(),
    nombre: z.string(),
    slug: z.string(),
    descripcion: nullableStringSchema.optional(),
    specs: z.record(z.string(), z.unknown()).nullable().optional(),
    stock: z.number().int(),
    estado: productStatusSchema,
    precioVenta: moneySchema,
    precioCosto: moneySchema,
    margenPorcentaje: moneySchema,
    moneda: z.string(),
    imagenes: z.array(productImageApiSchema).default([]),
    categorias: z.array(categoryApiSchema).default([]),
    createdAt: localDateTimeSchema,
    updatedAt: localDateTimeSchema.optional(),
});

export type ProductAdminApi = z.infer<typeof productAdminApiSchema>;

/** {@code DatosPrecio}. */
export const productPriceInputSchema = z.object({
    precioVenta: z.number().positive('El precio de venta debe ser mayor a 0'),
    precioCosto: z.number().positive('El precio de costo debe ser mayor a 0'),
    moneda: z.string().min(1, 'La moneda es obligatoria'),
});

/** {@code DatosCrearProducto} — body POST /api/productos. */
export const createProductRequestSchema = z.object({
    sku: z.string().min(1, 'El SKU es obligatorio'),
    nombre: z.string().min(2).max(255),
    descripcion: z.string().nullable().optional(),
    specs: z.record(z.string(), z.unknown()).nullable().optional(),
    stock: z.number().int().min(0),
    precio: productPriceInputSchema,
    categoriaIds: z.array(z.number().int().positive()).min(1, 'Al menos una categoría'),
    imagenesUrl: z.array(z.string().url()).optional(),
});

export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;

/** {@code DatosActualizarProducto} — PATCH parcial. */
export const updateProductRequestSchema = z.object({
    nombre: z.string().min(2).max(255).optional(),
    descripcion: z.string().nullable().optional(),
    specs: z.record(z.string(), z.unknown()).nullable().optional(),
    stock: z.number().int().min(0).optional(),
    categoriaIds: z.array(z.number().int().positive()).optional(),
});

export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;

export type UpdateProductPayload = UpdateProductRequest & {
    precio?: z.infer<typeof productPriceInputSchema>;
};

/** {@code DatosActualizarEstado}. */
export const updateProductStatusRequestSchema = z.object({
    estado: productStatusSchema,
});

export type UpdateProductStatusRequest = z.infer<typeof updateProductStatusRequestSchema>;

/** {@code DatosAgregarImagenes}. */
export const addProductImagesRequestSchema = z.object({
    imagenesUrl: z.array(z.string().url()).min(1),
});

export type AddProductImagesRequest = z.infer<typeof addProductImagesRequestSchema>;

/** Formulario admin (React Hook Form) — mapea a CreateProductRequest en el submit. */
export const productAdminFormSchema = z.object({
    sku: z.string().min(1),
    nombre: z.string().min(2).max(255),
    descripcion: z.string().optional(),
    stock: z.coerce.number().int().min(0),
    price: z.coerce.number().positive(),
    moneda: z.string().default('USD'),
    categoriaIds: z.array(z.coerce.number().int().positive()).min(1),
    imagenesUrl: z.array(z.string().url()).optional(),
});

export type ProductAdminFormValues = z.infer<typeof productAdminFormSchema>;

export function mapProductAdminFormToCreateRequest(
    values: ProductAdminFormValues
): CreateProductRequest {
    return {
        sku: values.sku.trim(),
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || null,
        stock: values.stock,
        precio: {
            precioVenta: values.price,
            precioCosto: values.price,
            moneda: values.moneda || 'USD',
        },
        categoriaIds: values.categoriaIds,
        imagenesUrl: values.imagenesUrl,
    };
}

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

export type ProductDetailViewModel = ProductCardView & {
    descripcion: string | null;
    specs: Record<string, unknown> | null;
    imagenes: ProductImageApi[];
    categorias: CategoryApi[];
};

/** Alias de compatibilidad para el view model de detalle de producto */
export type ProductDetailViewData = ProductDetailViewModel;

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
