/**
 * Almacén del Access Token en Memoria + sessionStorage con sincronización multi-pestaña.
 *
 * Principios de Seguridad (RFC 9700 / OWASP):
 * 1. El Access Token (15 min) se mantiene en memoria RAM y en sessionStorage (aislado por pestaña,
 *    sobrevive a recargas F5 y muere al cerrar la pestaña/navegador).
 * 2. NUNCA se persiste el JWT en localStorage (protección contra robo por XSS).
 * 3. En localStorage solo se almacena una bandera no sensible 'has_session' = '1' para que
 *    otras pestañas sepan que existe una sesión activa y puedan rehidratarse vía Cookie HttpOnly.
 */

const SESSION_TOKEN_KEY = 'auth_access_token';
const HAS_SESSION_FLAG = 'has_session';

let inMemoryToken: string | null = null;

function safeGetSessionStorage(key: string): string | null {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            return window.sessionStorage.getItem(key);
        }
    } catch {
        // En navegadores con almacenamiento restringido o modo incógnito extremo
    }
    return null;
}

function safeSetSessionStorage(key: string, value: string): void {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(key, value);
        }
    } catch {
        // Ignorar errores de cuota o seguridad en storage
    }
}

function safeRemoveSessionStorage(key: string): void {
    try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.removeItem(key);
        }
    } catch {
        // Ignorar
    }
}

function safeGetLocalStorage(key: string): string | null {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
        }
    } catch {
        // Ignorar
    }
    return null;
}

function safeSetLocalStorage(key: string, value: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    } catch {
        // Ignorar
    }
}

function safeRemoveLocalStorage(key: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    } catch {
        // Ignorar
    }
}

// Inicializar memoria desde sessionStorage si existe (ej. tras un F5 en la misma pestaña)
inMemoryToken = safeGetSessionStorage(SESSION_TOKEN_KEY);

/**
 * Obtiene el Access Token actual sincrónicamente para llamadas HTTP.
 */
export function getAccessToken(): string | null {
    if (inMemoryToken) {
        return inMemoryToken;
    }
    const token = safeGetSessionStorage(SESSION_TOKEN_KEY);
    if (token) {
        inMemoryToken = token;
        return token;
    }
    return null;
}

/**
 * Actualiza el Access Token en memoria y sessionStorage, o los limpia si es null.
 */
export function setAccessToken(token: string | null): void {
    inMemoryToken = token;
    if (token) {
        safeSetSessionStorage(SESSION_TOKEN_KEY, token);
        safeSetLocalStorage(HAS_SESSION_FLAG, '1');
        // Eliminar cualquier token legado que pudiera quedar en localStorage
        safeRemoveLocalStorage('token');
    } else {
        safeRemoveSessionStorage(SESSION_TOKEN_KEY);
        safeRemoveLocalStorage(HAS_SESSION_FLAG);
        safeRemoveLocalStorage('token');
    }
}

/**
 * Indica si existe una sesión activa registrada en el navegador.
 */
export function hasSessionFlag(): boolean {
    return safeGetLocalStorage(HAS_SESSION_FLAG) === '1';
}

/**
 * Limpia todos los tokens de memoria, sessionStorage y la bandera de localStorage.
 */
export function clearAuthTokens(): void {
    setAccessToken(null);
}

/**
 * Helper para inyectar token de prueba en tests unitarios sin tocar localStorage legado.
 */
export function setMockAccessToken(token: string | null): void {
    setAccessToken(token);
}

