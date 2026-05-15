import { createContext, useContext } from 'react';
import { useCart } from './CartContext';
import { useCheckoutLogic } from '../hooks/useCheckoutLogic';

const CheckoutContext = createContext();

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout debe usarse dentro de CheckoutProvider');
    }
    return context;
};

export const CheckoutProvider = ({ children }) => {
    const { items, cartTotal, isEmpty, refreshCart, loading: cartLoading } = useCart();
    const checkout = useCheckoutLogic({
        cartItems: items,
        cartTotal,
        refreshCart,
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
};
