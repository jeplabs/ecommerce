import { useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api';
import { mapCartApiToUiItems } from './mappers';
import type { CartActionResult, CartItemUiView } from './types';
import type { ProductApi } from '@/entities/product';
import { useAuth, useProduct } from '@/app/providers';
function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

export function useCartLogic() {
    const { isAuthenticated } = useAuth();
    const { productos } = useProduct();

    const [items, setItems] = useState<CartItemUiView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const catalog = productos as ProductApi[];

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await cartApi.getCart();
            setItems(mapCartApiToUiItems(data, catalog));
            setError(null);
        } catch (err) {
            // setError(toErrorMessage(err));
            // setItems([]);
            const message = toErrorMessage(err);
            setError(message);
            // Si el carrito expiró o no existe, limpiar la UI
            if (
                message.toLowerCase().includes('expir') ||
                message.toLowerCase().includes('no encontrado') ||
                message.toLowerCase().includes('vacío') ||
                message.toLowerCase().includes('not found')
            ) {
                setItems([]);
            }
        } finally {
            setLoading(false);
        }
    }, [catalog]);

    useEffect(() => {
        if (isAuthenticated) {
            void fetchCart();
        } else {
            setItems([]);
            setError(null);
        }
    }, [isAuthenticated, fetchCart]);

    useEffect(() => {
        if (isAuthenticated && catalog.length > 0 && items.length > 0) {
            void fetchCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- solo refrescar imágenes al cargar catálogo
    }, [catalog]);

    const addToCart = useCallback(
        async (productId: number, quantity = 1): Promise<CartActionResult> => {
            setLoading(true);
            try {
                const data = await cartApi.addToCart(productId, quantity);
                setItems(mapCartApiToUiItems(data, catalog));
                setError(null);
                return { success: true };
            } catch (err) {
                const message = toErrorMessage(err);
                setError(message);
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [catalog]
    );

    const removeFromCart = useCallback(
        async (itemId: number): Promise<CartActionResult> => {
            const previousItems = items;
            setItems((prev) => prev.filter((item) => item.id !== itemId));

            setLoading(true);
            try {
                const data = await cartApi.removeItem(itemId);
                setItems(mapCartApiToUiItems(data, catalog));
                setError(null);
                return { success: true };
            } catch (err) {
                setItems(previousItems);
                const message = toErrorMessage(err);
                setError(message);
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [items, catalog]
    );

    const updateQuantity = useCallback(
        async (itemId: number, quantity: number): Promise<CartActionResult> => {
            if (quantity <= 0) {
                return removeFromCart(itemId);
            }

            setLoading(true);
            try {
                const data = await cartApi.updateItemQuantity(itemId, quantity);
                setItems(mapCartApiToUiItems(data, catalog));
                setItems(mapCartApiToUiItems(data, catalog).sort((a, b) => a.id - b.id));
                setError(null);
                return { success: true };
            } catch (err) {
                const message = toErrorMessage(err);
                setError(message);
                return { success: false, error: message };
            } finally {
                setLoading(false);
            }
        },
        [catalog, removeFromCart]
    );

    const clearCart = useCallback(async (): Promise<CartActionResult> => {
        setLoading(true);
        try {
            await cartApi.clearCart();
            setItems([]);
            setError(null);
            return { success: true };
        } catch (err) {
            const message = toErrorMessage(err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCart = useCallback(async () => fetchCart(), [fetchCart]);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const isEmpty = items.length === 0;

    return {
        items,
        loading,
        error,
        cartCount,
        cartTotal,
        isEmpty,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
    };
}
