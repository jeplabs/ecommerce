import { API_URL } from '../config/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/apiHelpers';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
    if (response.status === 204) return null;

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
 * Capa HTTP para direcciones del usuario autenticado.
 */
export const direccionService = {
    async listar() {
        const response = await fetch(`${API_URL}/api/direcciones`, {
            method: 'GET',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async crear(datos) {
        const response = await fetch(`${API_URL}/api/direcciones`, {
            method: 'POST',
            headers: getAuthHeaders(getToken()),
            body: JSON.stringify(datos),
        });
        return handleResponse(response);
    },

    async actualizar(id, datos) {
        const response = await fetch(`${API_URL}/api/direcciones/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(getToken()),
            body: JSON.stringify(datos),
        });
        return handleResponse(response);
    },

    async cambiarPrincipal(id) {
        const response = await fetch(`${API_URL}/api/direcciones/${id}/principal`, {
            method: 'PATCH',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async eliminar(id) {
        const response = await fetch(`${API_URL}/api/direcciones/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },
};
