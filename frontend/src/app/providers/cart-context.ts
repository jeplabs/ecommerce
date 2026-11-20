import { createContext } from 'react';
import type { useCartLogic } from '@/features/cart';

export type CartContextValue = ReturnType<typeof useCartLogic>;

export const CartContext = createContext<CartContextValue | null>(null);
