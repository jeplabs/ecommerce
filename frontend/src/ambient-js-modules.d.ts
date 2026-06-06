/** Declaraciones mínimas para módulos JS legacy durante la migración a TS. */

declare module '@/shared/lib/http-session' {
    import type { NavigateFunction } from 'react-router-dom';

    export function getAuthHeaders(
        token: string | null,
        isJson?: boolean
    ): Record<string, string>;
    export function notifyUnauthorizedIfNeeded(status: number | undefined): void;
    export function parseListResponse(raw: unknown): unknown[];
    export function isAuthError(status: number): boolean;
    export function redirectUnauthorized(
        status: number | undefined,
        navigate: NavigateFunction,
        navigateOpts?: Record<string, unknown>
    ): boolean;
}

declare module '*.css' {
    const classes: Record<string, string>;
    export default classes;
}
