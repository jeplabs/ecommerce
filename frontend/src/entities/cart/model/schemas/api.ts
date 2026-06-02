import { z } from 'zod';
import { localDateTimeSchema, moneySchema, positiveIntSchema } from '@/shared/lib/zod-helpers';

/** {@code EstadoCarrito}. */
export const cartStatusSchema = z.enum(['ACTIVO', 'ABANDONADO', 'CONVERTIDO']);

/** {@code DatosRespuestaCarritoItem}. */
export const cartItemApiSchema = z.object({
    id: positiveIntSchema,
    productoId: positiveIntSchema,
    nombreProducto: z.string(),
    skuProducto: z.string(),
    cantidad: z.number().int().positive(),
    precioUnitario: moneySchema,
    subtotal: moneySchema,
});

/** {@code DatosRespuestaCarrito}. */
export const cartApiSchema = z.object({
    id: positiveIntSchema,
    estado: cartStatusSchema,
    expiraAt: localDateTimeSchema.nullable().optional(),
    items: z.array(cartItemApiSchema).default([]),
    total: moneySchema,
    totalItems: z.number().int().nonnegative(),
});

export type CartStatus = z.infer<typeof cartStatusSchema>;
export type CartItemApi = z.infer<typeof cartItemApiSchema>;
export type CartApi = z.infer<typeof cartApiSchema>;
