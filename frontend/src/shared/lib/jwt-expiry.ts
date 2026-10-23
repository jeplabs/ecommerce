/**
 * Utilidades para leer claims del JWT (payload sin verificar firma).
 * El backend realiza la verificación criptográfica; el frontend usa estos claims
 * como fuente de verdad inmediata para sincronizar estado de UI (expiración y rol).
 */

export type JwtPayload = {
    sub?: string;
    exp?: number;
    rol?: string;
    role?: string;
    [key: string]: unknown;
};

/**
 * Decodifica de forma segura el payload del JWT (sin validar firma en frontend).
 */
export function parseJwtPayload(token: string | null | undefined): JwtPayload | null {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const json = atob(padded);
        return JSON.parse(json) as JwtPayload;
    } catch {
        return null;
    }
}

/**
 * Lee la fecha de expiración del JWT en milisegundos.
 */
export function getJwtExpiryMs(token: string | null | undefined): number | null {
    const payload = parseJwtPayload(token);
    if (!payload?.exp || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
}

/**
 * Obtiene el rol del usuario directamente del payload del Access Token JWT.
 * Sirve como fuente de verdad inmutable mientras exista un token válido.
 */
export function getJwtRole(token: string | null | undefined): string | null {
    const payload = parseJwtPayload(token);
    const rol = payload?.rol || payload?.role;
    return typeof rol === 'string' ? rol : null;
}
