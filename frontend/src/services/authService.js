import { API_URL } from '../config/config';

/**
 * Capa de acceso HTTP al backend para autenticación y gestión de usuarios (auth).
 * Sin estado de React; solo fetch y errores.
 */
export const authService = {
    async login(email, password) {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error en el login');
        }
        return data;
    },

    /**
     * @returns {{ ok: boolean, data: object }}
     */
    async register(userData) {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        return { ok: response.ok, data };
    },

    async setUsuarioEstado(id, activo, token) {
        const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ activo }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al actualizar el estado del usuario');
        }
        return data;
    },
};
