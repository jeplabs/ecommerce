import { z } from 'zod';
import {
    localDateTimeSchema,
    moneySchema,
    nullableStringSchema,
    positiveIntSchema,
} from '@/shared/lib/zod-helpers';
import { categoryApiSchema } from '@/entities/category/model/schemas/api';

/** Alineado a {@code EstadoProducto} del backend. */
export const productStatusSchema = z.enum([
    'DISPONIBLE',
    'SIN_STOCK',
    'OCULTO',
    'DESCONTINUADO',
]);

export const productImageApiSchema = z.object({
    id: positiveIntSchema,
    url: z.string().url(),
    principal: z.boolean(),
});

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

/** {@code DatosRespuestaProductoAdmin}. */
export const productAdminApiSchema = z.object({
    id: positiveIntSchema,
    sku: z.string(),
    nombre: z.string(),
    slug: z.string(),
    stock: z.number().int(),
    estado: productStatusSchema,
    precioVenta: moneySchema,
    precioCosto: moneySchema,
    margenPorcentaje: moneySchema,
    moneda: z.string(),
    imagenes: z.array(productImageApiSchema).default([]),
    createdAt: localDateTimeSchema,
    updatedAt: localDateTimeSchema.optional(),
});

export type ProductImageApi = z.infer<typeof productImageApiSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
