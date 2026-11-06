/**
 * Sincronización de sesión fuera de React (servicios HTTP, utilidades y multi-pestaña).
 * Emite un evento cuando la sesión deja de ser válida en el cliente para que
 * AuthContext y la UI (navbar, rutas) se actualicen sin recargar la página.
 */
import { clearAuthTokens, getAccessToken, hasSessionFlag } from './auth-token-store';

export const AUTH_SESSION_INVALIDATED = 'ecommerce:auth-session-invalidated';
export const AUTH_SESSION_REFRESHED = 'ecommerce:auth-session-refreshed';

export type SessionRefreshedDetail = {
    token: string;
    rol: string | null;
};
const BROADCAST_CHANNEL_NAME = 'ecommerce_auth_channel';

export type AuthBroadcastMessage =
    | { type: 'LOGOUT'; reason?: string }
    | { type: 'LOGIN' };

let broadcastChannel: BroadcastChannel | null = null;
try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    }
} catch {
    // Entornos sin soporte de BroadcastChannel (ej. jsdom antiguo)
}

export function broadcastAuthEvent(message: AuthBroadcastMessage): void {
    try {
        broadcastChannel?.postMessage(message);
    } catch {
        // Ignorar errores al emitir broadcast
    }
}

export function subscribeAuthBroadcast(
    handler: (message: AuthBroadcastMessage) => void
): () => void {
    if (!broadcastChannel) {
        return () => {};
    }
    const listener = (event: MessageEvent<AuthBroadcastMessage>) => {
        if (event.data && typeof event.data.type === 'string') {
            handler(event.data);
        }
    };
    broadcastChannel.addEventListener('message', listener);
    return () => {
        broadcastChannel?.removeEventListener('message', listener);
    };
}

export function clearAuthStorage(): void {
    clearAuthTokens();
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('user');
        }
    } catch {
        // Ignorar
    }
}

/**
 * Borra credenciales locales y notifica a la app si había sesión activa.
 * Llamadas repetidas tras un primer vaciado no vuelven a emitir el evento (evita toasts duplicados).
 */
export function invalidateClientSession(
    detail: Record<string, unknown> = {}
): void {
    const hadToken = !!getAccessToken() || (typeof window !== 'undefined' && !!localStorage.getItem('token')) || hasSessionFlag();
    clearAuthStorage();
    broadcastAuthEvent({ type: 'LOGOUT', reason: String(detail.reason || 'unauthorized') });
    if (!hadToken) return;
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent(AUTH_SESSION_INVALIDATED, {
                detail: { reason: 'unauthorized', ...detail },
            })
        );
    }
}

/**
 * @returns unsubscribe
 */
export function subscribeSessionInvalidated(
    handler: (detail: Record<string, unknown>) => void
): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }
    const listener = (event: Event) => {
        handler((event as CustomEvent<Record<string, unknown>>).detail || {});
    };
    window.addEventListener(AUTH_SESSION_INVALIDATED, listener);
    return () => window.removeEventListener(AUTH_SESSION_INVALIDATED, listener);
}

export function notifySessionRefreshed(detail: SessionRefreshedDetail): void {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent(AUTH_SESSION_REFRESHED, { detail })
        );
    }
}

export function subscribeSessionRefreshed(
    handler: (detail: SessionRefreshedDetail) => void
): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }
    const listener = (event: Event) => {
        const customEvent = event as CustomEvent<SessionRefreshedDetail>;
        if (customEvent.detail && typeof customEvent.detail.token === 'string') {
            handler(customEvent.detail);
        }
    };
    window.addEventListener(AUTH_SESSION_REFRESHED, listener);
    return () => window.removeEventListener(AUTH_SESSION_REFRESHED, listener);
}
