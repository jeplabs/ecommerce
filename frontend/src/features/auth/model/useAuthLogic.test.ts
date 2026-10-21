import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthLogic } from './useAuthLogic';
import { getAccessToken, clearAuthTokens } from '@/shared/lib/auth-token-store';
import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
    mockRegisterFormValues,
} from '@/test/msw/fixtures/auth';

describe('useAuthLogic', () => {
    beforeEach(() => {
        clearAuthTokens();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('login de cliente persiste sesión en memoria/sessionStorage y bandera has_session', async () => {
        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.login(MOCK_LOGIN_EMAIL, MOCK_LOGIN_PASSWORD);
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.rol).toBe('ROLE_CUSTOMER');
            }
        });

        // En arquitectura de Doble Token, el Access Token NO va en localStorage, sino en memoria/sessionStorage
        expect(getAccessToken()).toBe(mockAuthTokenResponse.token);
        expect(sessionStorage.getItem('auth_access_token')).toBe(mockAuthTokenResponse.token);
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('has_session')).toBe('1');
        expect(localStorage.getItem('rol')).toBe('ROLE_CUSTOMER');
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('login de admin persiste rol admin y token en memoria', async () => {
        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.login(MOCK_ADMIN_EMAIL, MOCK_LOGIN_PASSWORD);
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.rol).toBe('ROLE_ADMIN');
            }
        });

        expect(getAccessToken()).toBe(mockAdminAuthTokenResponse.token);
        expect(sessionStorage.getItem('auth_access_token')).toBe(mockAdminAuthTokenResponse.token);
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('rol')).toBe('ROLE_ADMIN');
        expect(result.current.userRol).toBe('ROLE_ADMIN');
    });

    it('register de cliente devuelve éxito', async () => {
        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.register({
                ...mockRegisterFormValues,
                email: 'hook.register@example.com',
            });
            expect(response.success).toBe(true);
        });
    });

    it('register y login con el mismo usuario dejan sesión activa', async () => {
        const email = 'hook.register-login@example.com';
        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const registerResponse = await result.current.register({
                ...mockRegisterFormValues,
                email,
            });
            expect(registerResponse.success).toBe(true);
        });

        await act(async () => {
            const loginResponse = await result.current.login(email, MOCK_LOGIN_PASSWORD);
            expect(loginResponse.success).toBe(true);
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(getAccessToken()).toBeTruthy();
        expect(localStorage.getItem('rol')).toBe('ROLE_CUSTOMER');
    });

    it('logout limpia la sesión local y el backend', async () => {
        sessionStorage.setItem('auth_access_token', mockAuthTokenResponse.token);
        localStorage.setItem('has_session', '1');
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
        localStorage.setItem('user', JSON.stringify({ email: MOCK_LOGIN_EMAIL }));

        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.isAuthenticated).toBe(true);

        await act(async () => {
            await result.current.logout();
        });

        expect(getAccessToken()).toBeNull();
        expect(sessionStorage.getItem('auth_access_token')).toBeNull();
        expect(localStorage.getItem('has_session')).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('rol')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.userRol).toBeNull();
    });
});
