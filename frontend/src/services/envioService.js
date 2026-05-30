import { API_URL } from '../config/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '../utils/apiHelpers';

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        notifyUnauthorizedIfNeeded(response.status);
        const err = new Error(data.message || data.error || 'Error al cargar opciones de envío');
        err.status = response.status;
        err.data = data;
        throw err;
    }
    return data;
};

/**
 * Opciones de envío para checkout (requiere JWT de cliente).
 * @param {number} subtotal
 */
export const envioService = {
    async getOpciones(subtotal = 0) {
        const params = new URLSearchParams({
            subtotal: String(Math.max(0, Number(subtotal) || 0)),
        });
        const response = await fetch(`${API_URL}/api/envio/opciones?${params}`, {
            method: 'GET',
            headers: getAuthHeaders(getToken()),
        });
        return handleResponse(response);
    },
};
