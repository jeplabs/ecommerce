/** Base URL de la API; debe coincidir con `VITE_API_URL` del `.env`. */
function resolveApiBase(): string {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    return 'http://localhost:8080';
}

export const API_BASE = resolveApiBase();

export const apiPath = (path: string) => `${API_BASE}${path}`;
