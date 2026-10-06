import { useState, useEffect, useCallback, useRef } from 'react';
import { cartApi } from '../api';
import { mapCartApiToUiItems } from './mappers';
import type {
    CartActionResult,
    CartItemUiView,
    CartExpirationApi,
    ItemNoRestauradoApi,
    RestaurarCartResult,
    CartApi,
} from './types';
import type { ProductApi } from '@/entities/product';
import { useAuth, useProduct } from '@/app/providers';
import { ApiError } from '@/shared';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function is410GoneError(error: unknown): boolean {
    if (error instanceof ApiError && error.status === 410) {
        return true;
    }
    if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 410) {
        return true;
    }
    return false;
}

export function useCartLogic() {
    const { isAuthenticated } = useAuth();
    const { productos } = useProduct();

    const [items, setItems] = useState<CartItemUiView[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [expiracion, setExpiracion] = useState<CartExpirationApi | null>(null);
    const [segundosRestantes, setSegundosRestantes] = useState<number | null>(null);
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const [itemsNoRestaurados, setItemsNoRestaurados] = useState<ItemNoRestauradoApi[]>([]);

    const catalog = productos as ProductApi[];
    const deadlineMsRef = useRef<number | null>(null);

    const applyCartData = useCallback((data: CartApi, catalogProducts: ProductApi[]) => {
        setItems(mapCartApiToUiItems(data, catalogProducts));
        setError(null);

        if (data.expiracion) {
            setExpiracion(data.expiracion);
            deadlineMsRef.current = performance.now() + data.expiracion.segundosRestantes * 1000;
            setSegundosRestantes(data.expiracion.segundosRestantes);

            if (data.expiracion.carritoAnteriorExpirado) {
                setShowExpiredModal(true);
            }
        }
    }, []);

    const handleExpirationError = useCallback((err: unknown) => {
        const message = toErrorMessage(err);
        setError(message);
        if (is410GoneError(err)) {
            setItems([]);
            setExpiracion(null);
            setSegundosRestantes(0);
            deadlineMsRef.current = null;
            setShowExpiredModal(true);
            return true;
        }
        return false;
    }, []);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await cartApi.getCart();
            applyCartData(data, catalog);
        } catch (err) {
            if (!handleExpirationError(err)) {
                const message = toErrorMessage(err);
                if (
                    message.toLowerCase().includes('expir') ||
                    message.toLowerCase().includes('no encontrado') ||
                    message.toLowerCase().includes('not found')
                ) {
                    setItems([]);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [catalog, applyCartData, handleExpirationError]);

    // Reloj/Temporizador monótono de cuenta regresiva basado en performance.now()
    useEffect(() => {
        if (deadlineMsRef.current === null || segundosRestantes === null || segundosRestantes <= 0) {
            return;
        }

        const timer = setInterval(() => {
            if (deadlineMsRef.current === null) return;
            const now = performance.now();
            const diffSec = Math.max(0, Math.round((deadlineMsRef.current - now) / 1000));
            setSegundosRestantes(diffSec);

            if (diffSec <= 0) {
                clearInterval(timer);
                deadlineMsRef.current = null;
                if (items.length > 0) {
                    setShowExpiredModal(true);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [segundosRestantes, items.length]);

    // Listener de visibilitychange para re-validar el carrito al enfocar la pestaña
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && isAuthenticated) {
                void fetchCart();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAuthenticated, fetchCart]);

    useEffect(() => {
        if (isAuthenticated) {
            void fetchCart();
        } else {
            setItems([]);
            setError(null);
            setExpiracion(null);
            setSegundosRestantes(null);
            deadlineMsRef.current = null;
        }
    }, [isAuthenticated, fetchCart]);

    useEffect(() => {
        if (isAuthenticated && catalog.length > 0 && items.length > 0) {
            void fetchCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalog]);

    const addToCart = useCallback(
        async (productId: number, quantity = 1): Promise<CartActionResult> => {
            setLoading(true);
            try {
                const data = await cartApi.addToCart(productId, quantity);
                applyCartData(data, catalog);
                return { success: true };
            } catch (err) {
                const isExpired = handleExpirationError(err);
                const message = toErrorMessage(err);
                return { success: false, error: message, isExpired };
            } finally {
                setLoading(false);
            }
        },
        [catalog, applyCartData, handleExpirationError]
    );

    const removeFromCart = useCallback(
        async (itemId: number): Promise<CartActionResult> => {
            const previousItems = items;
            setItems((prev) => prev.filter((item) => item.id !== itemId));

            setLoading(true);
            try {
                const data = await cartApi.removeItem(itemId);
                applyCartData(data, catalog);
                return { success: true };
            } catch (err) {
                setItems(previousItems);
                const isExpired = handleExpirationError(err);
                const message = toErrorMessage(err);
                return { success: false, error: message, isExpired };
            } finally {
                setLoading(false);
            }
        },
        [items, catalog, applyCartData, handleExpirationError]
    );

    const updateQuantity = useCallback(
        async (itemId: number, quantity: number): Promise<CartActionResult> => {
            if (quantity <= 0) {
                return removeFromCart(itemId);
            }

            setLoading(true);
            try {
                const data = await cartApi.updateItemQuantity(itemId, quantity);
                applyCartData(data, catalog);
                return { success: true };
            } catch (err) {
                const isExpired = handleExpirationError(err);
                const message = toErrorMessage(err);
                return { success: false, error: message, isExpired };
            } finally {
                setLoading(false);
            }
        },
        [catalog, removeFromCart, applyCartData, handleExpirationError]
    );

    const clearCart = useCallback(async (): Promise<CartActionResult> => {
        setLoading(true);
        try {
            const data = await cartApi.clearCart();
            applyCartData(data, catalog);
            return { success: true };
        } catch (err) {
            const isExpired = handleExpirationError(err);
            const message = toErrorMessage(err);
            return { success: false, error: message, isExpired };
        } finally {
            setLoading(false);
        }
    }, [catalog, applyCartData, handleExpirationError]);

    const renovarCart = useCallback(async (): Promise<CartActionResult> => {
        setLoading(true);
        try {
            const data = await cartApi.renovarCart();
            applyCartData(data, catalog);
            return { success: true };
        } catch (err) {
            const isExpired = handleExpirationError(err);
            const message = toErrorMessage(err);
            return { success: false, error: message, isExpired };
        } finally {
            setLoading(false);
        }
    }, [catalog, applyCartData, handleExpirationError]);

    const restaurarCart = useCallback(async (): Promise<RestaurarCartResult> => {
        setLoading(true);
        try {
            const result = await cartApi.restaurarCart();
            applyCartData(result.carrito, catalog);
            setItemsNoRestaurados(result.itemsNoRestaurados);
            setShowExpiredModal(false);
            return { success: true, itemsNoRestaurados: result.itemsNoRestaurados };
        } catch (err) {
            const message = toErrorMessage(err);
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    }, [catalog, applyCartData]);

    const refreshCart = useCallback(async () => fetchCart(), [fetchCart]);
    const closeExpiredModal = useCallback(() => setShowExpiredModal(false), []);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const isEmpty = items.length === 0;

    return {
        items,
        loading,
        error,
        cartCount,
        cartTotal,
        isEmpty,
        expiracion,
        segundosRestantes,
        showExpiredModal,
        closeExpiredModal,
        itemsNoRestaurados,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        renovarCart,
        restaurarCart,
        refreshCart,
    };
}
