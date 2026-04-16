import { API_URL } from '../config/config';

const getAuthHeaders = (isJson = true) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

export const categoriasService = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/categorias`);
        if (!res.ok) {
            throw new Error(res.statusText || 'Error al cargar categorías');
        }
        return res.json();
    },

    create: async (categoriaDatos) => {
        const res = await fetch(`${API_URL}/api/categorias`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(categoriaDatos),
        });

        if (res.status === 401) {
            throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'No se pudo crear la categoría');
        }

        return res.json();
    }
};