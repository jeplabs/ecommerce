/**
 * Lee la fecha de expiración del JWT (payload sin verificar firma).
 * El cliente usa `exp` para cerrar sesión alineado al backend; la verificación real sigue siendo el servidor.
 *
 * @param {string | null | undefined} token
 * @returns {number | null} expiry en ms desde epoch, o null si no es JWT válido
 */
export function getJwtExpiryMs(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const json = atob(padded);
        const payload = JSON.parse(json);
        if (!payload.exp || typeof payload.exp !== 'number') return null;
        return payload.exp * 1000;
    } catch {
        return null;
    }
}
