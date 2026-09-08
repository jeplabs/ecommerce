import { z } from 'zod';
import { formaPagoSchema, orderStatusSchema } from './api';
import { paymentMethodSchema } from '@/features/checkout/model/schemas/payment';

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
    direccionId: z.number().int().positive(),
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
    direccionId: z.number().int().positive('Selecciona una dirección'),
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
