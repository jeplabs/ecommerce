import { useContext } from 'react';
import { FavoritesContext, type FavoritesContextValue } from './favorites-context';

export type { FavoritesContextValue };

export function useFavorites(): FavoritesContextValue {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
    }
    return context;
}
