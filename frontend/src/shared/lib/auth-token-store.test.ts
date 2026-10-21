import { beforeEach, describe, expect, it } from 'vitest';
import {
    clearAuthTokens,
    getAccessToken,
    hasSessionFlag,
    setAccessToken,
} from './auth-token-store';

describe('auth-token-store', () => {
    beforeEach(() => {
        clearAuthTokens();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('almacena el token en memoria y sessionStorage, y fija bandera has_session en localStorage', () => {
        expect(getAccessToken()).toBeNull();
        expect(hasSessionFlag()).toBe(false);

        setAccessToken('test-access-token-123');

        expect(getAccessToken()).toBe('test-access-token-123');
        expect(sessionStorage.getItem('auth_access_token')).toBe('test-access-token-123');
        expect(localStorage.getItem('has_session')).toBe('1');
        // Asegura que no se guarde el JWT en localStorage
        expect(localStorage.getItem('token')).toBeNull();
        expect(hasSessionFlag()).toBe(true);
    });

    it('elimina tokens de memoria, sessionStorage y bandera al pasar null o clearAuthTokens', () => {
        setAccessToken('token-a-borrar');
        expect(getAccessToken()).toBe('token-a-borrar');

        clearAuthTokens();

        expect(getAccessToken()).toBeNull();
        expect(sessionStorage.getItem('auth_access_token')).toBeNull();
        expect(localStorage.getItem('has_session')).toBeNull();
        expect(hasSessionFlag()).toBe(false);
    });
});

