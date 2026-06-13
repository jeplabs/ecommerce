import { type ReactNode } from 'react';
import { useCart } from '@/app/providers/useCart';
import { EnvioOpcionesProvider } from '@/app/providers/EnvioOpcionesProvider';
import { useCheckoutLogic } from '@/features/checkout/model/useCheckoutLogic';
import { CheckoutContext } from './checkout-context';

type CheckoutProviderInnerProps = {
    children: ReactNode;
};

function CheckoutProviderInner({ children }: CheckoutProviderInnerProps) {
    const { items, cartTotal, isEmpty, loading: cartLoading, refreshCart } = useCart();
    const checkout = useCheckoutLogic({
        cartItems: items,
        cartTotal,
        isEmpty,
        refreshCart,
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
