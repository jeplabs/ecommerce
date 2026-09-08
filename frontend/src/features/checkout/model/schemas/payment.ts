import { z } from 'zod';
import { orderApiSchema } from '@/entities/order/model/schemas/api';
import { moneySchema } from '@/shared';

/** Métodos de pasarela simulados en checkout (no confundir con {@code FormaPago} del backend). */
export const paymentMethodSchema = z.enum(['stripe', 'qpaypro', 'webpay', 'mercadopago', 'transferencia', 'contra_entrega']);

export const PAYMENT_METHODS = {
    STRIPE: 'stripe',
    QPAYPRO: 'qpaypro',
    WEBPAY: 'webpay',
    MERCADOPAGO: 'mercadopago',
    BANK_TRANSFER: 'transferencia',
    CONTRA_ENTREGA: 'contra_entrega',
} as const;

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export function isBankTransferPaymentMethod(
    method: PaymentMethod | null | undefined
): boolean {
    return method === PAYMENT_METHODS.BANK_TRANSFER;
}

export const stripeCardFormSchema = z.object({
    cardholder: z.string(),
    cardNumber: z.string(),
    expiry: z.string(),
    cvc: z.string(),
});

export type StripeCardFormValues = z.infer<typeof stripeCardFormSchema>;

export const processPaymentInputSchema = z.object({
    method: paymentMethodSchema,
    amount: z.number().nonnegative(),
    orderReference: z.string().min(1),
    cardData: stripeCardFormSchema.optional(),
});

export type ProcessPaymentInput = z.infer<typeof processPaymentInputSchema>;

export const paymentSuccessResultSchema = z.object({
    success: z.literal(true),
    transactionId: z.string(),
    provider: z.string(),
    amount: z.number(),
    orderReference: z.string(),
    last4: z.string().optional(),
    authorizationCode: z.string().optional(),
});

export const paymentFailureResultSchema = z.object({
    success: z.literal(false),
    error: z.string(),
});

export const paymentResultSchema = z.discriminatedUnion('success', [
    paymentSuccessResultSchema,
    paymentFailureResultSchema,
]);

export type PaymentSuccessResult = z.infer<typeof paymentSuccessResultSchema>;
export type PaymentFailureResult = z.infer<typeof paymentFailureResultSchema>;
export type PaymentResult = z.infer<typeof paymentResultSchema>;

export const webpayInitResponseSchema = z.object({
    url: z.string().min(1),
    token: z.string().min(1),
});
export type WebpayInitResult = z.infer<typeof webpayInitResponseSchema>;

export const webpayPaymentApiSchema = z.object({
    transactionId: z.string().min(1),
    authorizationCode: z.string(),
    amount: moneySchema,
});
export type WebpayPaymentApi = z.infer<typeof webpayPaymentApiSchema>;

export const webpayConfirmSuccessSchema = z.object({
    success: z.literal(true),
    orden: orderApiSchema,
    payment: webpayPaymentApiSchema,
});
export type WebpayConfirmSuccess = z.infer<typeof webpayConfirmSuccessSchema>;

export const webpayConfirmFailureSchema = z.object({
    success: z.literal(false),
    error: z.string(),
    motivo: z.enum(['ABORTED', 'TIMEOUT', 'REJECTED']).optional(),
});
export type WebpayConfirmFailure = z.infer<typeof webpayConfirmFailureSchema>;

export const webpayConfirmResponseSchema = z.discriminatedUnion('success', [
    webpayConfirmSuccessSchema,
    webpayConfirmFailureSchema,
]);
export type WebpayConfirmResponse = z.infer<typeof webpayConfirmResponseSchema>;

export const webpayEstadoSchema = z.object({
    ordenId: z.number(),
    estado: z.enum(['INICIADA', 'APROBADA', 'RECHAZADA', 'ABORTADA', 'TIMEOUT']),
    motivo: z.enum(['ABORTED', 'TIMEOUT', 'REJECTED']).nullish(),
});

export type WebpayEstadoSchema = z.infer<typeof webpayEstadoSchema>;

export const qpayproInitResponseSchema = z.object({
    redirectUrl: z.string().min(1),
});
export type QPayProInitResult = z.infer<typeof qpayproInitResponseSchema>;

export const qpayproEstadoSchema = z.object({
    ordenId: z.number(),
    estado: z.enum(['PENDIENTE', 'APROBADA', 'DENEGADA', 'ANULADA']),
    transactionId: z.string().optional(),
});
export type QPayProEstadoSchema = z.infer<typeof qpayproEstadoSchema>;