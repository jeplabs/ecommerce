import { createContext } from 'react';
import type { useProducts } from '@/entities/product/model/useProducts';

export type ProductContextValue = ReturnType<typeof useProducts>;

export const ProductContext = createContext<ProductContextValue | null>(null);
