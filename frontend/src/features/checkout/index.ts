export * from './types';
export * from './lib';
export * from './api';
export * from './hooks';
export * from './components';

// Compatibilidad con imports antiguos que leían directamente de `features/checkout`
export {
    paymentMethodSchema,
    stripeCardFormSchema,
    processPaymentInputSchema,
    paymentResultSchema,
    paymentSuccessResultSchema,
    paymentFailureResultSchema,
    type PaymentSuccessResult,
    type PaymentFailureResult,
    type StripeCardFormValues,
    PAYMENT_METHODS,
    type PaymentMethod,
} from './types/payment';

export {
    CHECKOUT_STEPS,
    CHECKOUT_STEP_LABELS,
    CHECKOUT_SUCCESS_STEP_INDEX,
    CHECKOUT_FLOW_LAST_INDEX,
    type CheckoutStep,
} from './lib/checkoutSteps';

export { pickPostCheckoutProducts } from './lib/checkout-recommendations';
