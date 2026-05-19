/**
 * Sincronización de sesión fuera de React (servicios HTTP, utilidades).
 * Emite un evento cuando la sesión deja de ser válida en el cliente para que
 * AuthContext y la UI (navbar, rutas) se actualicen sin recargar la página.
 */

export const AUTH_SESSION_INVALIDATED = 'ecommerce:auth-session-invalidated';

export function clearAuthStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('user');
}

/**
 * Borra credenciales locales y notifica a la app si había sesión activa.
 * Llamadas repetidas tras un primer vaciado no vuelven a emitir el evento (evita toasts duplicados).
 *
 * @param {Record<string, unknown>} [detail]
 */
export function invalidateClientSession(detail = {}) {
    const hadToken = !!localStorage.getItem('token');
    clearAuthStorage();
    if (!hadToken) return;
    window.dispatchEvent(
        new CustomEvent(AUTH_SESSION_INVALIDATED, {
            detail: { reason: 'unauthorized', ...detail },
        })
    );
}

/**
 * @param {(detail: Record<string, unknown>) => void} handler
 * @returns {() => void} unsubscribe
 */
export function subscribeSessionInvalidated(handler) {
    const listener = (event) => {
        handler(event.detail || {});
    };
    window.addEventListener(AUTH_SESSION_INVALIDATED, listener);
    return () => window.removeEventListener(AUTH_SESSION_INVALIDATED, listener);
}
