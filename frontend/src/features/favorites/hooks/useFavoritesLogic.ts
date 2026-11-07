import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import type { ProductApi } from '@/entities/product';
import { addFavorite as addFavoriteApi, fetchFavorites, removeFavorite as removeFavoriteApi } from '../api/favoritesApi';
import type { FavoriteProduct, ToggleFavoriteResult } from '../types';

export function useFavoritesLogic() {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const reloadFavorites = useCallback(async () => {
        if (!isAuthenticated) {
            setFavorites([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const items = await fetchFavorites();
            setFavorites(items);
        } catch {
            setFavorites([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        void reloadFavorites();
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

                const nuevo = await addFavoriteApi(product.id);
                setFavorites((prev) => [nuevo, ...prev]);
                return { success: true, added: true };
            } catch (error) {
                const message = error instanceof Error ? error.message : 'No se pudo actualizar favoritos';
                return { success: false, error: message };
            }
        },
        [favorites, isAuthenticated]
    );

    const removeFavorite = useCallback(async (productId: number) => {
        await removeFavoriteApi(productId);
        setFavorites((prev) => prev.filter((item) => item.productId !== productId));
    }, []);

    return {
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        reloadFavorites,
    };
}

