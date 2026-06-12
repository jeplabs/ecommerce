import { createContext } from 'react';
import type { useCartLogic } from '@/entities/cart';

export type CartContextValue = ReturnType<typeof useCartLogic>;

export const CartContext = createContext<CartContextValue | null>(null);
