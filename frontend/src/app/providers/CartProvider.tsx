import { type ReactNode } from 'react';
import { useCartLogic, CartExpiredModal } from '@/features/cart';
import { CartContext } from './cart-context';

type CartProviderProps = {
    children: ReactNode;
};

export function CartProvider({ children }: CartProviderProps) {
    const cart = useCartLogic();

    return (
        <CartContext.Provider value={cart}>
            {children}
            <CartExpiredModal />
        </CartContext.Provider>
    );
}
