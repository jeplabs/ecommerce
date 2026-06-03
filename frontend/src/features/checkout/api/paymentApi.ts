import {
    PAYMENT_METHODS,
    processPaymentInputSchema,
    type PaymentMethod,
    type PaymentResult,
    type ProcessPaymentInput,
    type StripeCardFormValues,
} from '../model/schemas/payment';

export { PAYMENT_METHODS, type PaymentMethod, type PaymentResult, type ProcessPaymentInput };

/** Tarjetas de prueba estilo Stripe (solo demo). */
const STRIPE_TEST_CARDS = {
    success: '4242424242424242',
    decline: '4000000000000002',
} as const;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const generateTransactionId = (provider: PaymentMethod): string => {
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
    return provider === PAYMENT_METHODS.WEBPAY
        ? `WP_SIM_${Date.now()}_${suffix}`
        : `pi_sim_${Date.now()}_${suffix}`;
};

const validateStripeCard = (cardData: StripeCardFormValues | undefined) => {
    const number = (cardData?.cardNumber ?? '').replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(number)) {
        return { valid: false as const, error: 'Número de tarjeta inválido' };
    }
    if (!cardData?.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        return { valid: false as const, error: 'Fecha de expiración inválida (MM/AA)' };
    }
    if (!cardData?.cvc || !/^\d{3,4}$/.test(cardData.cvc)) {
        return { valid: false as const, error: 'CVC inválido' };
    }
    if (!cardData?.cardholder?.trim()) {
        return { valid: false as const, error: 'Nombre del titular requerido' };
    }
    return { valid: true as const, number };
};

/**
 * Simula el flujo de pago antes de crear la orden en el backend.
 * Sustituir por Stripe.js o Webpay Plus en producción.
 */
export async function processPayment(params: ProcessPaymentInput): Promise<PaymentResult> {
    const { method, amount, orderReference, cardData } = processPaymentInputSchema.parse(params);

    await delay(method === PAYMENT_METHODS.WEBPAY ? 2200 : 1600);

    if (method === PAYMENT_METHODS.STRIPE) {
        const validation = validateStripeCard(cardData);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        const normalized = validation.number;
        if (normalized === STRIPE_TEST_CARDS.decline) {
            return {
                success: false,
                error: 'Tu tarjeta fue rechazada (simulación Stripe). Prueba con 4242 4242 4242 4242.',
            };
        }

        if (normalized !== STRIPE_TEST_CARDS.success) {
            return {
                success: false,
                error: 'Tarjeta no reconocida en modo demo. Usa 4242 4242 4242 4242 para éxito.',
            };
        }

        return {
            success: true,
            transactionId: generateTransactionId(PAYMENT_METHODS.STRIPE),
            provider: 'Stripe (simulado)',
            amount,
            orderReference,
            last4: normalized.slice(-4),
        };
    }

    if (method === PAYMENT_METHODS.WEBPAY) {
        return {
            success: true,
            transactionId: generateTransactionId(PAYMENT_METHODS.WEBPAY),
            provider: 'Webpay Plus (simulado)',
            amount,
            orderReference,
            authorizationCode: `AUTH${Date.now().toString().slice(-8)}`,
        };
    }

    return { success: false, error: 'Método de pago no soportado' };
}

/** Fachada compatible con el antiguo `paymentService`. */
export const paymentApi = {
    PAYMENT_METHODS,
    processPayment,
};

export const paymentService = paymentApi;
