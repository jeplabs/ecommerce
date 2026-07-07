import { z } from 'zod';

/** Métodos de pasarela simulados en checkout (no confundir con {@code FormaPago} del backend). */
export const paymentMethodSchema = z.enum(['stripe', 'webpay', 'mercadopago', 'transferencia', 'contra_entrega']);

export const PAYMENT_METHODS = {
    STRIPE: 'stripe',
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
