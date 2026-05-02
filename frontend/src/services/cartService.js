import { API_URL } from '../config/config';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cartService = {
    async getCart() {
        const response = await fetch(`${API_URL}/api/carrito`, {
            method: 'GET',
            headers: { ...getAuthHeader() }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al obtener carrito');
        return data;
    },

    async addToCart(productId, quantity) {
        const response = await fetch(`${API_URL}/api/carrito/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ productoId: productId, cantidad: quantity })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al agregar');
        return data;
    },

    async updateItemQuantity(itemId, quantity) {
        const response = await fetch(`${API_URL}/api/carrito/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ cantidad: quantity })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al actualizar');
        return data;
    },

    async removeItem(itemId) {
        const response = await fetch(`${API_URL}/api/carrito/items/${itemId}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar');
        }
        return data;
    },

    async clearCart() {
        const response = await fetch(`${API_URL}/api/carrito`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al limpiar');
        return data;
    }
};