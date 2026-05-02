import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuthLogic } from './useAuthLogic';

// Mapear estructura del backend a estructura del frontend
const mapCartResponse = (response) => {
    if (!response || !response.items) return [];
    
    return response.items.map(item => ({
        id: item.id,
        productoId: item.productoId,
        name: item.nombreProducto,
        sku: item.skuProducto,
        price: parseFloat(item.precioUnitario),
        quantity: item.cantidad,
        qty: item.cantidad, // Alias para compatibilidad
        subtotal: parseFloat(item.subtotal)
    }));
};

export const useCartLogic = () => {
    const { isAuthenticated } = useAuthLogic();
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar carrito al cambiar estado de auth
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setItems([]);
            setError(null);
        }
    }, [isAuthenticated]);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const data = await cartService.getCart();
            const mappedItems = mapCartResponse(data);
            setItems(mappedItems);
            setError(null);
        } catch (err) {
            setError(err.message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        setLoading(true);
        try {
            const data = await cartService.addToCart(productId, quantity);
            const mappedItems = mapCartResponse(data);
            setItems(mappedItems);
            setError(null);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        if (quantity <= 0) return removeFromCart(itemId);
        
        setLoading(true);
        try {
            const data = await cartService.updateItemQuantity(itemId, quantity);
            const mappedItems = mapCartResponse(data);
            setItems(mappedItems);
            setError(null);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const removeFromCart = useCallback(async (itemId) => {
        // Optimistic update
        const previousItems = items;
        setItems(prev => prev.filter(item => item.id !== itemId));
        
        setLoading(true);
        try {
            const data = await cartService.removeItem(itemId);
            const mappedItems = mapCartResponse(data);
            setItems(mappedItems);
            setError(null);
            return { success: true };
        } catch (err) {
            setItems(previousItems); // Revertir
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [items]);

    const clearCart = useCallback(async () => {
        setLoading(true);
        try {
            await cartService.clearCart();
            setItems([]);
            setError(null);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshCart = useCallback(async () => {
        return fetchCart();
    }, []);

    // Cálculos derivados
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
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
        refreshCart
    };
};