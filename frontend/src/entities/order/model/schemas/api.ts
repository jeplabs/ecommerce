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

/** {@code MetodoPago} — código del método de pago usado en la orden. */
export const metodoPagoSchema = z.enum([
    'CONTRA_ENTREGA',
    'STRIPE',
    'WEBPAY',
    'MERCADO_PAGO',
    'TRANSFERENCIA',
    'TRANSFERENCIA_BANCARIA',
]);

/** {@code DatosRespuestaBancoAccount} — snapshot en la orden. */
export const bankAccountApiSchema = z.object({
    id: z.number().int().positive(),
    banco: z.string(),
    titular: z.string(),
    tipoCuenta: z.string(),
    numeroCuenta: z.string(),
    moneda: z.string(),
    activo: z.boolean(),
    ordenViualizacion: z.number().nullable().optional(),
});

/** {@code DatosRespuestaMetodoPago} — snapshot en la orden. */
export const metodoPagoApiSchema = z.object({
    id: z.number().int().positive(),
    codigo: z.string(),
    nombre: z.string(),
    descripcion: z.string().nullable().optional(),
    activo: z.boolean(),
    tipo: z.string(),
    ordenVisualizacion: z.number(),
    configuracion: z.json().nullable().optional(),
});

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

/** {@code TipoMetodoPago}. */
export const tipoMetodoPagoSchema = z.enum(['PASARELA', 'TRANSFERENCIA', 'CONTRA_ENTREGA']);

/** {@code DatosRespuestaOrden}. */
export const orderApiSchema = z.object({
    id: positiveIntSchema,
    estado: orderStatusSchema,
    direccionId: z.number().int().positive().nullable().optional(),
    direccionEnvio: orderShippingAddressApiSchema.nullable().optional(),
    servicioEnvio: z.string().nullable().optional(),
    formaPagoEnvio: formaPagoSchema,
    metodoPago: metodoPagoSchema,
    metodoPagoNombre: z.string().nullable().optional(),
    tipoMetodoPago: tipoMetodoPagoSchema.nullable().optional(),
    comprobanteUrl: z.string().nullable().optional(),
    comprobanteNombre: z.string().nullable().optional(),
    comprobanteFecha: localDateTimeSchema.nullable().optional(),
    items: z.array(orderItemApiSchema).default([]),
    subtotal: moneySchema,
    iva: moneySchema,
    costoEnvio: moneySchema,
    notaEnvio: nullableStringSchema,
    total: moneySchema,
    notas: nullableStringSchema,
    creadoAt: localDateTimeSchema,
    actualizadoAt: localDateTimeSchema,
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type FormaPago = z.infer<typeof formaPagoSchema>;
export type MetodoPago = z.infer<typeof metodoPagoSchema>;
export type TipoMetodoPago = z.infer<typeof tipoMetodoPagoSchema>;
export type MetodoPagoApi = z.infer<typeof metodoPagoApiSchema>;
export type BancoAccountApi = z.infer<typeof bankAccountApiSchema>;
export type OrderShippingAddressApi = z.infer<typeof orderShippingAddressApiSchema>;
export type OrderItemApi = z.infer<typeof orderItemApiSchema>;
export type OrderApi = z.infer<typeof orderApiSchema>;
