/**
 * Fachada de compatibilidad: implementación en features/checkout/api.
 * @deprecated Preferir `import { paymentApi, PAYMENT_METHODS } from '@/features/checkout'`
 */
export {
    paymentService,
    paymentApi,
    processPayment,
    PAYMENT_METHODS,
} from '@/features/checkout/api/paymentApi';
