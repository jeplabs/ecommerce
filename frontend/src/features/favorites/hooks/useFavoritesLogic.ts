import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import type { ProductApi } from '@/entities/product';
import {
    addFavorite as addFavoriteApi,
    fetchFavoriteIds,
    fetchFavorites,
    removeFavorite as removeFavoriteApi,
} from '../api/favoritesApi';
import type { FavoriteProduct, ToggleFavoriteResult } from '../types';

const DEFAULT_PAGE_SIZE = 12;

export function useFavoritesLogic() {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const reloadFavorites = useCallback(async () => {
        if (!isAuthenticated) {
            setFavorites([]);
            setFavoriteIds(new Set());
            setTotalElements(0);
            setTotalPages(1);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const [ids, pageData] = await Promise.all([
                fetchFavoriteIds().catch(() => []),
                fetchFavorites(page - 1, DEFAULT_PAGE_SIZE).catch(() => ({
                    content: [],
                    totalElements: 0,
                    totalPages: 1,
                    size: DEFAULT_PAGE_SIZE,
                    number: 0,
                })),
            ]);

            setFavoriteIds(new Set(ids));
            setFavorites(pageData.content);
            setTotalElements(pageData.totalElements ?? ids.length);
            setTotalPages(Math.max(1, pageData.totalPages ?? 1));
        } catch {
            setFavorites([]);
            setFavoriteIds(new Set());
            setTotalElements(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, page]);

    useEffect(() => {
        void reloadFavorites();
    }, [reloadFavorites]);

    const isFavorite = useCallback(
        (productId: number) => favoriteIds.has(productId),
        [favoriteIds]
    );

    const toggleFavorite = useCallback(
        async (product: ProductApi): Promise<ToggleFavoriteResult> => {
            if (!isAuthenticated) {
                return { success: false, requiresAuth: true };
            }

            const wasFavorite = favoriteIds.has(product.id);
            const prevIds = new Set(favoriteIds);
            const prevFavorites = [...favorites];
            const prevTotal = totalElements;

            try {
                if (wasFavorite) {
                    // Actualización optimista: quitar
                    setFavoriteIds((prev) => {
                        const next = new Set(prev);
                        next.delete(product.id);
                        return next;
                    });
                    setFavorites((prev) => prev.filter((item) => item.productId !== product.id));
                    const nextTotal = Math.max(0, totalElements - 1);
                    setTotalElements(nextTotal);
                    setTotalPages(Math.max(1, Math.ceil(nextTotal / DEFAULT_PAGE_SIZE)));

                    await removeFavoriteApi(product.id);
                    return { success: true, added: false };
                }

                // Actualización optimista: agregar
                setFavoriteIds((prev) => new Set(prev).add(product.id));
                const nuevo = await addFavoriteApi(product.id);
                setFavorites((prev) => [nuevo, ...prev]);
                const nextTotal = totalElements + 1;
                setTotalElements(nextTotal);
                setTotalPages(Math.max(1, Math.ceil(nextTotal / DEFAULT_PAGE_SIZE)));

                return { success: true, added: true };
            } catch (error) {
                // Rollback en caso de error
                setFavoriteIds(prevIds);
                setFavorites(prevFavorites);
                setTotalElements(prevTotal);

                const message =
                    error instanceof Error ? error.message : 'No se pudo actualizar favoritos';
                return { success: false, error: message };
            }
        },
        [favoriteIds, favorites, isAuthenticated, totalElements]
    );

    const removeFavorite = useCallback(
        async (productId: number) => {
            const prevIds = new Set(favoriteIds);
            const prevFavorites = [...favorites];
            const prevTotal = totalElements;

            try {
                setFavoriteIds((prev) => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
                setFavorites((prev) => prev.filter((item) => item.productId !== productId));
                const nextTotal = Math.max(0, totalElements - 1);
                setTotalElements(nextTotal);
                setTotalPages(Math.max(1, Math.ceil(nextTotal / DEFAULT_PAGE_SIZE)));

                await removeFavoriteApi(productId);
            } catch (err) {
                setFavoriteIds(prevIds);
                setFavorites(prevFavorites);
                setTotalElements(prevTotal);
                throw err;
            }
        },
        [favoriteIds, favorites, totalElements]
    );

    return {
        favorites,
        favoriteIds,
        loading,
        page,
        setPage,
        totalPages,
        totalElements,
        pageSize: DEFAULT_PAGE_SIZE,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        reloadFavorites,
    };
}
