/**
 * Genera headers para fetch.
 * @param {string|null} token - Token de autenticación.
 * @param {boolean} isJson - Si el contenido es JSON.
 */
export const getAuthHeaders = (token, isJson = true) => {
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

/**
 * Normaliza respuestas de Spring Data Page o listas.
 */
export const parseListResponse = (raw) => {
    if (!raw) return [];
    if (raw?.content && Array.isArray(raw.content)) return raw.content;
    if (Array.isArray(raw)) return raw;
    return [];
};

/**
 * Verifica si hay error 401. No ejecuta efectos secundarios (como redirección).
 * Solo retorna booleano para que el caller decida qué hacer.
 */
export const isAuthError = (status) => status === 401;