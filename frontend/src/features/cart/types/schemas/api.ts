import { z } from 'zod';
import { localDateTimeSchema, moneySchema, positiveIntSchema } from '@/shared/lib/zod-helpers';

/** {@code EstadoCarrito}. */
export const cartStatusSchema = z.enum(['ACTIVO', 'ABANDONADO', 'CONVERTIDO', 'EXPIRADO']);

/** {@code DatosExpiracionCarrito}. */
export const cartExpirationSchema = z.object({
    expiraAt: z.string().nullable().optional(),
    segundosRestantes: z.number().int().nonnegative(),
    ttlTotalSegundos: z.number().int().positive(),
    avisoSegundosAntes: z.number().int().nonnegative(),
    carritoAnteriorExpirado: z.boolean().default(false),
});

/** Motivos de ítems no restaurados. */
export const itemNoRestauradoMotivoSchema = z.enum([
    'SIN_STOCK',
    'STOCK_PARCIAL',
    'NO_DISPONIBLE',
    'SIN_PRECIO',
]);

/** {@code ItemNoRestaurado}. */
export const itemNoRestauradoSchema = z.object({
    productoId: positiveIntSchema,
    nombre: z.string(),
    motivo: itemNoRestauradoMotivoSchema,
    cantidadSolicitada: z.number().int().positive().optional(),
    cantidadRestaurada: z.number().int().nonnegative().optional(),
});

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
    expiracion: cartExpirationSchema.optional(),
});

/** {@code DatosRespuestaRestauracion}. */
export const restauracionCartApiSchema = z.object({
    carrito: cartApiSchema,
    itemsNoRestaurados: z.array(itemNoRestauradoSchema).default([]),
});

export type CartStatus = z.infer<typeof cartStatusSchema>;
export type CartExpirationApi = z.infer<typeof cartExpirationSchema>;
export type ItemNoRestauradoMotivo = z.infer<typeof itemNoRestauradoMotivoSchema>;
export type ItemNoRestauradoApi = z.infer<typeof itemNoRestauradoSchema>;
export type CartItemApi = z.infer<typeof cartItemApiSchema>;
export type CartApi = z.infer<typeof cartApiSchema>;
export type RestauracionCartApi = z.infer<typeof restauracionCartApiSchema>;
