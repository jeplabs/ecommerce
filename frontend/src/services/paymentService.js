/**
 * Pasarela de pago simulada (desarrollo / demo).
 * No realiza cargos reales. Sustituir por Stripe.js o Webpay Plus en producción.
 */

export const PAYMENT_METHODS = {
    STRIPE: 'stripe',
    WEBPAY: 'webpay',
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Tarjetas de prueba estilo Stripe */
const STRIPE_TEST_CARDS = {
    success: '4242424242424242',
    decline: '4000000000000002',
};

const generateTransactionId = (provider) => {
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();
    return provider === PAYMENT_METHODS.WEBPAY
        ? `WP_SIM_${Date.now()}_${suffix}`
        : `pi_sim_${Date.now()}_${suffix}`;
};

const validateStripeCard = (cardData) => {
    const number = (cardData.cardNumber || '').replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(number)) {
        return { valid: false, error: 'Número de tarjeta inválido' };
    }
    if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        return { valid: false, error: 'Fecha de expiración inválida (MM/AA)' };
    }
    if (!cardData.cvc || !/^\d{3,4}$/.test(cardData.cvc)) {
        return { valid: false, error: 'CVC inválido' };
    }
    if (!cardData.cardholder?.trim()) {
        return { valid: false, error: 'Nombre del titular requerido' };
    }
    return { valid: true, number };
};

export const paymentService = {
    PAYMENT_METHODS,

    /**
     * Simula el flujo de pago antes de crear la orden en el backend.
     * @param {{ method: string, amount: number, orderReference: string, cardData?: object }} params
     */
    async processPayment({ method, amount, orderReference, cardData }) {
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
    },
};
