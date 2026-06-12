import { type ReactNode } from 'react';
import { useCartLogic } from '@/entities/cart';
import { CartContext } from './cart-context';

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
