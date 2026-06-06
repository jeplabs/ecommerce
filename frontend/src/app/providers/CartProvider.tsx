import { createContext, useContext, type ReactNode } from 'react';
import { useCartLogic } from '@/entities/cart';

export type CartContextValue = ReturnType<typeof useCartLogic>;

const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};

type CartProviderProps = {
    children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
    const cart = useCartLogic();

    return (
        <CartContext.Provider
            value={{
                items: cart.items,
                loading: cart.loading,
                error: cart.error,
                cartCount: cart.cartCount,
                cartTotal: cart.cartTotal,
                isEmpty: cart.isEmpty,
                addToCart: cart.addToCart,
                updateQuantity: cart.updateQuantity,
                removeFromCart: cart.removeFromCart,
                clearCart: cart.clearCart,
                refreshCart: cart.refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
