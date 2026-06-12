import { createContext } from 'react';
import type { useCheckoutLogic } from '@/features/checkout/model/useCheckoutLogic';

export type CheckoutContextValue = ReturnType<typeof useCheckoutLogic> & {
    cartLoading: boolean;
    isEmpty: boolean;
};

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);
