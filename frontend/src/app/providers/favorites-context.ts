import { createContext } from 'react';
import type { useFavoritesLogic } from '@/features/favorites/model/useFavoritesLogic';

export type FavoritesContextValue = ReturnType<typeof useFavoritesLogic>;

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);
