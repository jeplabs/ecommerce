import { createContext } from 'react';
import type { useProducts } from '@/features/catalog';

export type ProductContextValue = ReturnType<typeof useProducts>;

export const ProductContext = createContext<ProductContextValue | null>(null);
