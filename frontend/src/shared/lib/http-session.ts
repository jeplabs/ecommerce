import { invalidateClientSession } from '@/auth/authSessionSync';
import type { NavigateFunction } from 'react-router-dom';

export function getAuthHeaders(
    token: string | null | undefined,
    isJson = true
): Record<string, string> {
    const headers: Record<string, string> = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
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
