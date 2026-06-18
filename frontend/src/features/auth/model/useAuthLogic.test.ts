import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAuthLogic } from './useAuthLogic';
import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
    mockRegisterFormValues,
} from '@/test/msw/fixtures/auth';

describe('useAuthLogic', () => {
    it('login de cliente persiste sesión en localStorage', async () => {
        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.login(MOCK_LOGIN_EMAIL, MOCK_LOGIN_PASSWORD);
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.rol).toBe('ROLE_CUSTOMER');
            }
        });

        expect(localStorage.getItem('token')).toBe(mockAuthTokenResponse.token);
        expect(localStorage.getItem('rol')).toBe('ROLE_CUSTOMER');
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('login de admin persiste rol admin', async () => {
        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const response = await result.current.login(MOCK_ADMIN_EMAIL, MOCK_LOGIN_PASSWORD);
            expect(response.success).toBe(true);
            if (response.success) {
                expect(response.rol).toBe('ROLE_ADMIN');
            }
        });

        expect(localStorage.getItem('token')).toBe(mockAdminAuthTokenResponse.token);
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

    it('logout limpia la sesión local', async () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_CUSTOMER');
        localStorage.setItem('user', JSON.stringify({ email: MOCK_LOGIN_EMAIL }));

        const { result } = renderHook(() => useAuthLogic());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.isAuthenticated).toBe(true);

        act(() => {
            result.current.logout();
        });

        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('rol')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.userRol).toBeNull();
    });
});
