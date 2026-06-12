import { useContext } from 'react';
import { CheckoutContext, type CheckoutContextValue } from './checkout-context';

export type { CheckoutContextValue };

export function useCheckout(): CheckoutContextValue {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout debe usarse dentro de CheckoutProvider');
    }
    return context;
}
