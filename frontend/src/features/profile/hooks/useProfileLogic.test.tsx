import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfileLogic } from './useProfileLogic';
import {
    MOCK_LOGIN_PASSWORD,
    mockAuthTokenResponse,
    mockUserProfile,
} from '@/test/msw/fixtures/auth';
import { clearAuthTokens, setAccessToken } from '@/lib/auth-token-store';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <MemoryRouter>{children}</MemoryRouter>;
    };
}

describe('useProfileLogic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearAuthTokens();
        localStorage.clear();
    });

    it('redirige a /login si no hay token al montar', async () => {
        const { result } = renderHook(() => useProfileLogic(), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
        });
        expect(result.current.usuario).toBeNull();
    });

    it('carga el perfil del usuario cuando hay token', async () => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('token', mockAuthTokenResponse.token);

        const { result } = renderHook(() => useProfileLogic(), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.usuario).not.toBeNull();
        expect(result.current.usuario?.email).toBe(mockUserProfile.email);
        expect(result.current.error).toBeNull();
    });

    it('actualiza el perfil mediante updatePerfil', async () => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('token', mockAuthTokenResponse.token);

        const { result } = renderHook(() => useProfileLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            const res = await result.current.updatePerfil({
                nombre: 'Carlos',
                apellido: 'Gómez',
                pais: 'CL',
            });
            expect(res.success).toBe(true);
        });

        expect(result.current.usuario?.nombre).toBe('Carlos');
        expect(result.current.usuario?.apellido).toBe('Gómez');
    });

    it('actualiza la contraseña exitosamente', async () => {
        setAccessToken(mockAuthTokenResponse.token);
        localStorage.setItem('token', mockAuthTokenResponse.token);

        const { result } = renderHook(() => useProfileLogic(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.loading).toBe(false));

        let response: { success: boolean } | undefined;
        await act(async () => {
            response = await result.current.updatePassword({
                passwordActual: MOCK_LOGIN_PASSWORD,
                password: 'NuevaPassword123!',
                confirmarPassword: 'NuevaPassword123!',
            });
        });

        expect(response?.success).toBe(true);
        expect(result.current.error).toBeNull();
    });
});
