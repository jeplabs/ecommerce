import { z } from 'zod';

/** Métodos de pasarela simulados en checkout (no confundir con {@code FormaPago} del backend). */
export const paymentMethodSchema = z.enum([
    'stripe',
    'qpaypro',
    'webpay',
    'mercadopago',
    'transferencia',
    'contra_entrega',
]);

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
