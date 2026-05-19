import { invalidateClientSession } from '../auth/authSessionSync';

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

/**
 * Invocado ante respuestas 401: vacía sesión local y notifica a React (navbar, rutas).
 * Idempotente si ya se llamó antes en la misma cadena de errores.
 *
 * @param {number | undefined} status
 */
export function notifyUnauthorizedIfNeeded(status) {
    if (status === 401) {
        invalidateClientSession({ reason: 'unauthorized' });
    }
}

/**
 * Tras un 401: sincroniza sesión y opcionalmente envía al login (SPA).
 *
 * @param {number | undefined} status
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {object} [navigateOpts] extras para navigate (p. ej. state)
 * @returns {boolean} true si era 401 y se redirigió
 */
export function redirectUnauthorized(status, navigate, navigateOpts = {}) {
    if (!isAuthError(status)) return false;
    invalidateClientSession({ reason: 'unauthorized' });
    navigate('/login', { replace: true, ...navigateOpts });
    return true;
}