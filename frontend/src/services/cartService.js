import { API_URL } from '../config/config'; // Asumiendo que tienes este config

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cartService = {
    async getCart() {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'GET',
            headers: { ...getAuthHeader() }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al obtener carrito');
        return data;
    },

    async addToCart(productId, quantity) {
        const response = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ productId, quantity })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al agregar');
        return data;
    },

    async updateItemQuantity(itemId, quantity) {
        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify({ quantity })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al actualizar');
        return data;
    },

    async removeItem(itemId) {
        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Error al eliminar');
        }
        return true;
    },

    async clearCart() {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        if (!response.ok) throw new Error('Error al limpiar');
        return true;
    }
};