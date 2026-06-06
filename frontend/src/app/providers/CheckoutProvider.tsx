import { createContext, useContext, type ReactNode } from 'react';
import { useCart } from '@/app/providers/CartProvider';
import { EnvioOpcionesProvider } from '@/app/providers/EnvioOpcionesProvider';
import { useCheckoutLogic } from '@/features/checkout/model/useCheckoutLogic';

export type CheckoutContextValue = ReturnType<typeof useCheckoutLogic> & {
    cartLoading: boolean;
    isEmpty: boolean;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export const useCheckout = (): CheckoutContextValue => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout debe usarse dentro de CheckoutProvider');
    }
    return context;
};

type CheckoutProviderInnerProps = {
    children: ReactNode;
};

function CheckoutProviderInner({ children }: CheckoutProviderInnerProps) {
    const { items, cartTotal, isEmpty, loading: cartLoading } = useCart();
    const checkout = useCheckoutLogic({
        cartItems: items,
        cartTotal,
        isEmpty,
    });

    return (
        <CheckoutContext.Provider
            value={{
                ...checkout,
                cartLoading,
                isEmpty,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
}

type CheckoutProviderProps = {
    children: ReactNode;
};

export function CheckoutProvider({ children }: CheckoutProviderProps) {
    return (
        <EnvioOpcionesProvider>
            <CheckoutProviderInner>{children}</CheckoutProviderInner>
        </EnvioOpcionesProvider>
    );
}
