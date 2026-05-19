import { API_URL } from '../config/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/apiHelpers';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        notifyUnauthorizedIfNeeded(response.status);
        const err = new Error(data.message || data.error || 'Error en la solicitud');
        err.status = response.status;
        err.data = data;
        throw err;
    }
    return data;
};

/**
 * Capa de acceso HTTP al backend para autenticación y gestión de usuarios (auth).
 * Sin estado de React; solo fetch y errores.
 * Los errores lanzados incluyen `status` cuando el backend lo envía (p. ej. 401).
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

    /** Lista de usuarios (solo ADMIN). Usa el token en localStorage. */
    async listUsuarios() {
        const response = await fetch(`${API_URL}/api/auth/usuarios`, {
            method: 'GET',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async setUsuarioEstado(id, activo) {
        const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/estado`, {
            method: 'PATCH',
            headers: getAuthHeaders(getToken()),
            body: JSON.stringify({ activo }),
        });
        return handleResponse(response);
    },

    async getUsuarioById(id) {
        const response = await fetch(`${API_URL}/api/auth/usuarios/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async updateUsuarioRol(id, rol) {
        const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/rol`, {
            method: 'PATCH',
            headers: getAuthHeaders(getToken()),
            body: JSON.stringify({ rol }),
        });
        return handleResponse(response);
    },
};
