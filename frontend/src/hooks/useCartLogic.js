import { useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { useAuthLogic } from './useAuthLogic'; 

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
            // Ajusta según si tu backend devuelve { items: [...] } o [...]
            setItems(data.items || data); 
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        setLoading(true);
        try {
            const data = await cartService.addToCart(productId, quantity);
            setItems(data.items || data);
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
        
        try {
            const data = await cartService.updateItemQuantity(itemId, quantity);
            setItems(data.items || data);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, []);

    const removeFromCart = useCallback(async (itemId) => {
        // Optimistic update
        const previousItems = items;
        setItems(prev => prev.filter(item => item.id !== itemId));
        
        try {
            await cartService.removeItem(itemId);
            return { success: true };
        } catch (err) {
            setItems(previousItems); // Revertir
            setError(err.message);
            return { success: false, error: err.message };
        }
    }, [items]);

    const clearCart = useCallback(async () => {
        try {
            await cartService.clearCart();
            setItems([]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
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
        refreshCart: fetchCart
    };
};