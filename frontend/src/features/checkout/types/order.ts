import { z } from 'zod';
import {
    localDateTimeSchema,
    moneySchema,
    nullableStringSchema,
    positiveIntSchema,
} from '@/shared/lib/zod-helpers';
import { createSpringPageSchema, type SpringPage } from '@/shared/api/spring-page';
import { paymentMethodSchema } from './paymentMethods';

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
    'QPAYPRO',
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
    horario: nullableStringSchema.optional(),
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
    sucursalId: z.number().int().positive().nullable().optional(),
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

export const orderPageSchema = createSpringPageSchema(orderApiSchema);
export type OrderPage = SpringPage<OrderApi>;

const metodoPagoCodigoSchema = z.enum([
    'STRIPE',
    'WEBPAY',
    'QPAYPRO',
    'MERCADO_PAGO',
    'TRANSFERENCIA',
    'CONTRA_ENTREGA',
]);

/** {@code DatosCrearOrden} — el carrito se resuelve en servidor. */
export const createOrderRequestSchema = z.object({
    direccionId: z.number().int().positive().nullable().optional(),
    sucursalId: z.number().int().positive().nullable().optional(),
    servicioEnvioId: z.number().int().positive(),
    formaPagoEnvio: formaPagoSchema,
    metodoPagoCodigo: metodoPagoCodigoSchema,
    notas: z.string().nullable().optional(),
});

/** {@code DatosActualizarEstadoOrden} — admin. */
export const updateOrderStatusRequestSchema = z.object({
    estado: orderStatusSchema,
});

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof updateOrderStatusRequestSchema>;

/** Checkout — selección de envío en UI (mapea a CreateOrderRequest). */
export const checkoutOrderFormSchema = z.object({
    direccionId: z.number().int().positive('Selecciona una dirección').nullable().optional(),
    sucursalId: z.number().int().positive('Selecciona una sucursal').nullable().optional(),
    servicioEnvioId: z.number().int().positive('Selecciona un servicio de envío'),
    formaPagoEnvio: formaPagoSchema,
    metodoPagoEnvio: paymentMethodSchema,
    notas: z.string().max(500).optional(),
});

export type CheckoutOrderFormValues = z.infer<typeof checkoutOrderFormSchema>;

export function mapCheckoutFormToCreateOrderRequest(
    values: CheckoutOrderFormValues
): CreateOrderRequest {
    return {
        direccionId: values.direccionId,
        sucursalId: values.sucursalId,
        servicioEnvioId: values.servicioEnvioId,
        formaPagoEnvio: values.formaPagoEnvio,
        metodoPagoCodigo:
            values.metodoPagoEnvio === 'transferencia'
                ? 'TRANSFERENCIA'
                : values.metodoPagoEnvio === 'webpay'
                ? 'WEBPAY'
                : values.metodoPagoEnvio === 'qpaypro'
                ? 'QPAYPRO'
                : values.metodoPagoEnvio === 'mercadopago'
                ? 'MERCADO_PAGO'
                : 'STRIPE',
        notas: values.notas?.trim() || null,
    };
}

/** Forma de pago del envío en checkout (alias semántico). */
export const formaPagoEnvioSchema = formaPagoSchema;

export type OrderSummaryCardView = {
    id: number;
    estado: OrderApi['estado'];
    total: number;
    itemsCount: number;
    creadoAt: string;
    servicioEnvio: string | null;
};

export type OrderDetailView = OrderApi;

export type OrderListFilters = {
    estado?: OrderApi['estado'];
    page?: number;
    size?: number;
};
