import { invalidateClientSession } from './auth-session-sync';
import { getAccessToken } from './auth-token-store';
import type { NavigateFunction } from 'react-router-dom';

type RefreshHandler = () => Promise<string | null>;
let onRefreshToken: RefreshHandler | null = null;

export function registerRefreshTokenHandler(handler: RefreshHandler): void {
    onRefreshToken = handler;
}

export function getAuthHeaders(
    token?: string | null,
    isJson = true
): Record<string, string> {
    const resolvedToken = token !== undefined ? token : getAccessToken();
    const headers: Record<string, string> = {};
    if (resolvedToken) {
        headers.Authorization = `Bearer ${resolvedToken}`;
    }
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
}

export async function fetchWithAuth(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {
    const token = getAccessToken();
    const headers = new Headers(init.headers || {});
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(input, {
        ...init,
        headers,
    });

    if (response.status === 401 && onRefreshToken) {
        const newToken = await onRefreshToken();
        if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
            return fetch(input, {
                ...init,
                headers,
            });
        }
        notifyUnauthorizedIfNeeded(401);
    }

    return response;
}

export function parseListResponse(raw: unknown): unknown[] {
    if (!raw) return [];
    if (
        typeof raw === 'object' &&
        raw !== null &&
        'content' in raw &&
        Array.isArray((raw as { content: unknown }).content)
    ) {
        return (raw as { content: unknown[] }).content;
    }
    if (Array.isArray(raw)) return raw;
    return [];
}

export const isAuthError = (status: number | undefined): boolean => status === 401;

export function notifyUnauthorizedIfNeeded(status: number | undefined): void {
    if (status === 401) {
        invalidateClientSession({ reason: 'unauthorized' });
    }
}

export function redirectUnauthorized(
    status: number | undefined,
    navigate: NavigateFunction,
    navigateOpts: Record<string, unknown> = {}
): boolean {
    if (!isAuthError(status)) return false;
    invalidateClientSession({ reason: 'unauthorized' });
    navigate('/login', { replace: true, ...navigateOpts });
    return true;
}
