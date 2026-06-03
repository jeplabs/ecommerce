/** Declaraciones mínimas para módulos JS legacy durante la migración a TS. */

declare module '@/config/config' {
    export const API_URL: string;
}

declare module '@/shared/lib/http-session' {
    export function getAuthHeaders(
        token: string | null,
        isJson?: boolean
    ): Record<string, string>;
    export function notifyUnauthorizedIfNeeded(status: number | undefined): void;
    export function parseListResponse(raw: unknown): unknown[];
    export function isAuthError(status: number): boolean;
}

/** @deprecated Usar `@/shared/lib/http-session`. */
declare module '@/utils/apiHelpers' {
    export function getAuthHeaders(
        token: string | null,
        isJson?: boolean
    ): Record<string, string>;
    export function notifyUnauthorizedIfNeeded(status: number | undefined): void;
    export function parseListResponse(raw: unknown): unknown[];
    export function isAuthError(status: number): boolean;
}
