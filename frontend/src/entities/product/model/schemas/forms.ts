import { z } from 'zod';
import { productStatusSchema } from './api';

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

/** {@code DatosActualizarProducto} — PATCH parcial. */
export const updateProductRequestSchema = z.object({
    nombre: z.string().min(2).max(255).optional(),
    descripcion: z.string().nullable().optional(),
    specs: z.record(z.string(), z.unknown()).nullable().optional(),
    stock: z.number().int().min(0).optional(),
    categoriaIds: z.array(z.number().int().positive()).optional(),
});

/** {@code DatosActualizarEstado}. */
export const updateProductStatusRequestSchema = z.object({
    estado: productStatusSchema,
});

/** {@code DatosAgregarImagenes}. */
export const addProductImagesRequestSchema = z.object({
    imagenesUrl: z.array(z.string().url()).min(1),
});

export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;
export type UpdateProductStatusRequest = z.infer<typeof updateProductStatusRequestSchema>;
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
