import { type ReactNode } from 'react';
import { useCartLogic } from '@/entities/cart';
import { CartContext } from './cart-context';
import CartExpiredModal from '@/widgets/cart/CartExpiredModal';

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
