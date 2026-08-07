import { ZodError } from 'zod';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    PAYMENT_METHODS,
    processPayment,
    type ProcessPaymentInput,
    type StripeCardFormValues,
} from './paymentApi';

afterEach(() => {
    vi.useRealTimers();
});

function build(overrides: Partial<ProcessPaymentInput> = {}): ProcessPaymentInput {
    return {
        method: PAYMENT_METHODS.STRIPE,
        amount: 100,
        orderReference: 'ORD-1',
        ...overrides,
    };
}

function card(overrides: Partial<StripeCardFormValues> = {}): StripeCardFormValues {
    return {
        cardholder: 'Test User',
        cardNumber: '4242 4242 4242 4242',
        expiry: '12/30',
        cvc: '123',
        ...overrides,
    };
}

async function pay(params: ProcessPaymentInput) {
    vi.useFakeTimers();
    const promise = processPayment(params);
    await vi.advanceTimersByTimeAsync(3000);
    const result = await promise;
    vi.useRealTimers();
    return result;
}

describe('processPayment', () => {
    it('rechaza la transferencia bancaria (usa otro flujo)', async () => {
        const result = await pay(build({ method: PAYMENT_METHODS.BANK_TRANSFER }));
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('no usa processPayment');
        }
    });

    it('acepta contra entrega', async () => {
        const result = await pay(build({ method: PAYMENT_METHODS.CONTRA_ENTREGA }));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.transactionId).toMatch(/^CE_SIM/);
        }
    });

    it.each([
        ['número inválido', { cardNumber: '123' }, 'Número de tarjeta inválido'],
        ['expiración inválida', { expiry: '13' }, 'Fecha de expiración inválida (MM/AA)'],
        ['cvc inválido', { cvc: '12' }, 'CVC inválido'],
        ['titular vacío', { cardholder: '   ' }, 'Nombre del titular requerido'],
    ])('valida la tarjeta: %s', async (_label, partial, expectedError) => {
        const result = await pay(build({ cardData: card(partial) }));
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe(expectedError);
        }
    });

    it('rechaza la tarjeta de decline', async () => {
        const result = await pay(
            build({ cardData: card({ cardNumber: '4000 0000 0000 0002' }) })
        );
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('rechazada');
        }
    });

    it('rechaza tarjetas no reconocidas en modo demo', async () => {
        const result = await pay(
            build({ cardData: card({ cardNumber: '4111 1111 1111 1111' }) })
        );
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain('no reconocida');
        }
    });

    it('aprueba la tarjeta de éxito de Stripe', async () => {
        const result = await pay(build({ cardData: card() }));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.transactionId).toMatch(/^pi_sim/);
            expect(result.last4).toBe('4242');
            expect(result.provider).toBe('Stripe (simulado)');
            expect(result.orderReference).toBe('ORD-1');
            expect(result.amount).toBe(100);
        }
    });

    it('aprueba Webpay (simulado)', async () => {
        const result = await pay(build({ method: PAYMENT_METHODS.WEBPAY }));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.transactionId).toMatch(/^WP_SIM/);
            expect(result.authorizationCode).toBeTypeOf('string');
        }
    });

    it('aprueba Mercado Pago (simulado)', async () => {
        const result = await pay(build({ method: PAYMENT_METHODS.MERCADOPAGO }));
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.transactionId).toMatch(/^MP_SIM/);
        }
    });

    it('falla la validación del schema con monto negativo', async () => {
        await expect(
            processPayment(
                build({ amount: -5, method: PAYMENT_METHODS.CONTRA_ENTREGA })
            )
        ).rejects.toBeInstanceOf(ZodError);
    });
});
