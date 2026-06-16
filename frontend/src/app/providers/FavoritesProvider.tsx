import type { ReactNode } from 'react';
import { useFavoritesLogic } from '@/features/favorites/model/useFavoritesLogic';
import { FavoritesContext, type FavoritesContextValue } from './favorites-context';

type FavoritesProviderProps = {
    children: ReactNode;
};

export function FavoritesProvider({ children }: FavoritesProviderProps) {
    const value: FavoritesContextValue = useFavoritesLogic();

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
