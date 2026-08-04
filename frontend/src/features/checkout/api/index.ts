export {
    paymentApi,
    processPayment,
    PAYMENT_METHODS,
    type PaymentMethod,
    type PaymentResult,
    type ProcessPaymentInput,
} from './paymentApi';

export {
    paymentGatewayApi,
    iniciarWebpay,
    confirmarWebpay,
} from './paymentGatewayApi';
