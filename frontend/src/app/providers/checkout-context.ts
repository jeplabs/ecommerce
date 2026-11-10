import { createContext } from 'react';
import type { useCheckoutLogic } from '@/features/checkout/hooks/useCheckoutLogic';

export type CheckoutContextValue = ReturnType<typeof useCheckoutLogic> & {
    cartLoading: boolean;
    isEmpty: boolean;
    showExpiredModal: boolean;
};

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);
