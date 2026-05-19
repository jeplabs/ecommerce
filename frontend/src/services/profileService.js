import { API_URL } from '../config/config';
import { getAuthHeaders, isAuthError, notifyUnauthorizedIfNeeded } from '../utils/apiHelpers';

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
 * Capa HTTP para el perfil del usuario autenticado.
 */
export const profileService = {
    async getPerfil() {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
            method: 'GET',
            headers: getAuthHeaders(token),
        });
        return handleResponse(response);
    },

    async updatePerfil(datos) {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify(datos),
        });
        return handleResponse(response);
    },

    isAuthError,
};
