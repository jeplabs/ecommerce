import { API_URL } from '../config/config';
import { getAuthHeaders } from '../utils/apiHelpers';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(data.message || data.error || 'Error en la solicitud');
        err.status = response.status;
        err.data = data;
        throw err;
    }
    return data;
};

/**
 * Capa HTTP para órdenes del usuario autenticado.
 */
export const ordenService = {
    async listarMisOrdenes(page = 0, size = 10) {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        const response = await fetch(`${API_URL}/api/ordenes?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async obtenerOrden(id) {
        const response = await fetch(`${API_URL}/api/ordenes/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async cancelarOrden(id) {
        const response = await fetch(`${API_URL}/api/ordenes/${id}/cancelar`, {
            method: 'PATCH',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },

    async crearOrden({ direccionId, notas }) {
        const response = await fetch(`${API_URL}/api/ordenes`, {
            method: 'POST',
            headers: getAuthHeaders(getToken()),
            body: JSON.stringify({ direccionId, notas: notas || null }),
        });
        return handleResponse(response);
    },
};
