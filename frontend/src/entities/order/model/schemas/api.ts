import { z } from 'zod';
import {
    localDateTimeSchema,
    moneySchema,
    nullableStringSchema,
    positiveIntSchema,
} from '@/shared/lib/zod-helpers';

/** {@code EstadoOrden}. */
export const orderStatusSchema = z.enum([
    'PENDIENTE',
    'CONFIRMADA',
    'EN_PROCESO',
    'ENVIADA',
    'ENTREGADA',
    'CANCELADA',
]);

/** {@code FormaPago} — pago del envío / contra entrega (no pasarela simulada). */
export const formaPagoSchema = z.enum(['EN_LINEA', 'CONTRA_ENTREGA']);

/** {@code MetodoPago} — método de pago del envío. */
export const metodoPagoSchema = z.enum(['EN_LINEA', 'CONTRA_ENTREGA', 'TRANSFERENCIA_BANCARIA']);

/** {@code DatosRespuestaDireccionOrden} — snapshot en la orden. */
export const orderShippingAddressApiSchema = z.object({
    alias: z.string(),
    calle: z.string(),
    ciudad: z.string(),
    estado: z.string(),
    codigoPostal: z.string().nullable().optional(),
    pais: z.string(),
    telefono: z.string().nullable().optional(),
    referencias: nullableStringSchema,
});

/** {@code DatosRespuestaOrdenItem}. */
export const orderItemApiSchema = z.object({
    id: positiveIntSchema,
    productoId: positiveIntSchema,
    sku: z.string(),
    nombreProducto: z.string(),
    cantidad: z.number().int().positive(),
    precioUnitario: moneySchema,
    precioBase: moneySchema,
    ivaUnitario: moneySchema,
    subtotal: moneySchema,
});

/** {@code DatosRespuestaOrden}. */
export const orderApiSchema = z.object({
    id: positiveIntSchema,
    estado: orderStatusSchema,
    direccionId: z.number().int().positive().nullable().optional(),
    direccionEnvio: orderShippingAddressApiSchema.nullable().optional(),
    servicioEnvio: z.string().nullable().optional(),
    formaPago: formaPagoSchema,
    metodoPago: metodoPagoSchema,
    items: z.array(orderItemApiSchema).default([]),
    subtotal: moneySchema,
    iva: moneySchema,
    costoEnvio: moneySchema,
    total: moneySchema,
    notas: nullableStringSchema,
    creadoAt: localDateTimeSchema,
    actualizadoAt: localDateTimeSchema,
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type FormaPago = z.infer<typeof formaPagoSchema>;
export type MetodoPago = z.infer<typeof metodoPagoSchema>;
export type OrderShippingAddressApi = z.infer<typeof orderShippingAddressApiSchema>;
export type OrderItemApi = z.infer<typeof orderItemApiSchema>;
export type OrderApi = z.infer<typeof orderApiSchema>;
