import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import type { ProductApi } from '@/entities/product';
import { addFavorite as addFavoriteApi, fetchFavorites, removeFavorite as removeFavoriteApi } from '../api/favoritesApi';
import type { FavoriteProduct, ToggleFavoriteResult } from './types';

export function useFavoritesLogic() {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);

    const reloadFavorites = useCallback(async () => {
        if (!isAuthenticated) {
            setFavorites([]);
            return;
        }

        try {
            const items = await fetchFavorites();
            setFavorites(items);
        } catch {
            setFavorites([]);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        reloadFavorites();
    }, [reloadFavorites, isAuthenticated]);

    const isFavorite = useCallback(
        (productId: number) => favorites.some((item) => item.productId === productId),
        [favorites]
    );

    const toggleFavorite = useCallback(
        async (product: ProductApi): Promise<ToggleFavoriteResult> => {
            if (!isAuthenticated) {
                return { success: false, requiresAuth: true };
            }

            const wasFavorite = favorites.some((item) => item.productId === product.id);
            try {
                if (wasFavorite) {
                    await removeFavoriteApi(product.id);
                    setFavorites((prev) => prev.filter((item) => item.productId !== product.id));
                    return { success: true, added: false };
                }

                const added = await addFavoriteApi(product.id);
                setFavorites((prev) => [
                    added,
                    ...prev.filter((item) => item.productId !== product.id),
                ]);
                return { success: true, added: true };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'No se pudo actualizar el favorito',
                };
            }
        },
        [isAuthenticated, favorites]
    );

    const removeFavorite = useCallback(
        async (productId: number): Promise<void> => {
            try {
                await removeFavoriteApi(productId);
                setFavorites((prev) => prev.filter((item) => item.productId !== productId));
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'No se pudo eliminar el favorito';
                throw new Error(message);
            }
        },
        []
    );

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        reloadFavorites,
    };
}
