import { createContext } from 'react';
import type { useCategorias as useCategoriasHook } from '@/features/catalog';

export type CategoriasContextValue = ReturnType<typeof useCategoriasHook>;

export const CategoriasContext = createContext<CategoriasContextValue | null>(null);
