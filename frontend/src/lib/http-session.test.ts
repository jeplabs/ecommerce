import { describe, expect, it, vi } from 'vitest';
import {
    getAuthHeaders,
    isAuthError,
    notifyUnauthorizedIfNeeded,
    parseListResponse,
    redirectUnauthorized,
} from './http-session';

describe('getAuthHeaders', () => {
    it('agrega Authorization y Content-Type con token', () => {
        expect(getAuthHeaders('tok123')).toEqual({
            Authorization: 'Bearer tok123',
            'Content-Type': 'application/json',
        });
    });

    it('omite Authorization sin token', () => {
        expect(getAuthHeaders(null)).toEqual({ 'Content-Type': 'application/json' });
        expect(getAuthHeaders(undefined)).toEqual({ 'Content-Type': 'application/json' });
    });

    it('omite Content-Type si isJson es false', () => {
        expect(getAuthHeaders('tok123', false)).toEqual({ Authorization: 'Bearer tok123' });
    });
});

describe('parseListResponse', () => {
    it('devuelve [] para null o no-objeto', () => {
        expect(parseListResponse(null)).toEqual([]);
        expect(parseListResponse('x')).toEqual([]);
        expect(parseListResponse(undefined)).toEqual([]);
    });

    it('extrae el array de content cuando está presente', () => {
        expect(parseListResponse({ content: [1, 2] })).toEqual([1, 2]);
        expect(parseListResponse({ content: 'no-array' })).toEqual([]);
    });

    it('devuelve el array tal cual', () => {
        expect(parseListResponse([1, 2])).toEqual([1, 2]);
    });

    it('devuelve [] para objetos sin content', () => {
        expect(parseListResponse({ total: 5 })).toEqual([]);
    });
});

describe('isAuthError', () => {
    it('solo considera 401', () => {
        expect(isAuthError(401)).toBe(true);
        expect(isAuthError(500)).toBe(false);
        expect(isAuthError(undefined)).toBe(false);
    });
});

describe('notifyUnauthorizedIfNeeded', () => {
    it('limpia la sesión local al recibir 401', () => {
        localStorage.setItem('token', 'abc');
        notifyUnauthorizedIfNeeded(401);
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('no hace nada con otro status', () => {
        localStorage.setItem('token', 'abc');
        notifyUnauthorizedIfNeeded(500);
        expect(localStorage.getItem('token')).toBe('abc');
    });
});

describe('redirectUnauthorized', () => {
    it('navega a /login y devuelve true con 401', () => {
        localStorage.setItem('token', 'abc');
        const navigate = vi.fn();
        const result = redirectUnauthorized(401, navigate, { state: { from: '/x' } });

        expect(result).toBe(true);
        expect(navigate).toHaveBeenCalledWith('/login', {
            replace: true,
            state: { from: '/x' },
        });
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('no navega y devuelve false con otro status', () => {
        const navigate = vi.fn();
        const result = redirectUnauthorized(500, navigate);

        expect(result).toBe(false);
        expect(navigate).not.toHaveBeenCalled();
    });
});
