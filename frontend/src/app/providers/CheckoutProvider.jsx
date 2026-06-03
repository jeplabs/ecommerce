import { createContext, useContext } from 'react';
import { useCart } from '@/app/providers/CartProvider';
import { EnvioOpcionesProvider } from '@/app/providers/EnvioOpcionesProvider';
import { useCheckoutLogic } from '@/hooks/useCheckoutLogic';

const CheckoutContext = createContext();

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout debe usarse dentro de CheckoutProvider');
    }
    return context;
};

function CheckoutProviderInner({ children }) {
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

export function CheckoutProvider({ children }) {
    return (
        <EnvioOpcionesProvider>
            <CheckoutProviderInner>{children}</CheckoutProviderInner>
        </EnvioOpcionesProvider>
    );
}
