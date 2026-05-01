import { createContext, useContext } from 'react';
import { useCartLogic } from '../hooks/useCartLogic';

const CartContext = createContext();

// Hook público simple (igual que tu useAuth)
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const cart = useCartLogic();

    return (
        <CartContext.Provider value={{
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
            refreshCart: cart.refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
};