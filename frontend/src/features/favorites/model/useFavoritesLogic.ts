import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import type { ProductApi } from '@/entities/product';
import {
    getFavoritesStorageKey,
    listFavorites,
    removeFavorite as removeFavoriteFromStorage,
    toggleFavoriteStorage,
} from '../lib/favorites-storage';
import { mapProductToFavorite } from './mapProductToFavorite';
import type { FavoriteProduct, ToggleFavoriteResult } from './types';

export function useFavoritesLogic() {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

    const reloadFavorites = useCallback(() => {
        setFavorites(listFavorites());
    }, []);

    useEffect(() => {
        reloadFavorites();
    }, [reloadFavorites, isAuthenticated]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key === getFavoritesStorageKey()) {
                reloadFavorites();
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [reloadFavorites]);

    const isFavorite = useCallback(
        (productId: number) => favorites.some((item) => item.productId === productId),
        [favorites]
    );

    const toggleFavorite = useCallback(
        (product: ProductApi): ToggleFavoriteResult => {
            if (!isAuthenticated) {
                return { success: false, requiresAuth: true };
            }
            const added = toggleFavoriteStorage(mapProductToFavorite(product));
            reloadFavorites();
            return { success: true, added };
        },
        [isAuthenticated, reloadFavorites]
    );

    const removeFavorite = useCallback(
        (productId: number) => {
            removeFavoriteFromStorage(productId);
            reloadFavorites();
        },
        [reloadFavorites]
    );

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        reloadFavorites,
    };
}
