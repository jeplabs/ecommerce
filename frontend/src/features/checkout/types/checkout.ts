import type { OrderApi } from './order';
import type { PaymentSuccessResult } from './payment';

export type CheckoutStep = 'pedido' | 'pago' | 'exito';

export type CheckoutSuccessLocationState = {
    orden?: OrderApi;
    payment?: PaymentSuccessResult | null;
    isBankTransfer?: boolean;
};
