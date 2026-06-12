import { useContext } from 'react';
import { CartContext, type CartContextValue } from './cart-context';

export type { CartContextValue };

export function useCart(): CartContextValue {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de CartProvider');
    }
    return context;
}
