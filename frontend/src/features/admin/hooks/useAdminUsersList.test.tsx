import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...mod,
        useNavigate: () => navigateMock,
    };
});

import { authApi } from '@/features/auth';
import { useAdminUsersList } from './useAdminUsersList';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <MemoryRouter>{children}</MemoryRouter>;
    };
}

describe('useAdminUsersList', () => {
    beforeEach(() => {
        localStorage.clear();
        navigateMock.mockReset();
        vi.restoreAllMocks();
    });

    it('redirige a /login si no hay token', async () => {
        renderHook(() => useAdminUsersList(), { wrapper: createWrapper() });

        await waitFor(() =>
            expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true })
        );
    });

    it('carga la lista de usuarios con sesión admin', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');

        const { result } = renderHook(() => useAdminUsersList(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBeNull();
        expect(result.current.users.length).toBeGreaterThanOrEqual(2);
    });

    it('captura errores de API y los expone en error', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(authApi, 'listUsuarios').mockRejectedValueOnce(new Error('Fallo en usuarios'));

        const { result } = renderHook(() => useAdminUsersList(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe('Fallo en usuarios');
        consoleSpy.mockRestore();
    });
});
