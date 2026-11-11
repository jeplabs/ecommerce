import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import {
    mockAdminAuthTokenResponse,
    mockUserProfile,
} from '@/test/msw/fixtures/auth';
import { useAdminUser } from './useAdminUser';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter>
                <AppProviders>{children}</AppProviders>
            </MemoryRouter>
        );
    };
}

describe('useAdminUser', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('deja loading en false sin usuario cuando el ID no es válido', async () => {
        const { result } = renderHook(() => useAdminUser('invalido'), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.user).toBeNull();
    });

    it('carga los datos del usuario por ID y permite actualizar su rol', async () => {
        localStorage.setItem('token', mockAdminAuthTokenResponse.token);
        localStorage.setItem('rol', 'ROLE_ADMIN');

        const { result } = renderHook(() => useAdminUser(mockUserProfile.id), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.user?.id).toBe(mockUserProfile.id);
        expect(result.current.rol).toBe('ROLE_CUSTOMER');

        let updateResult: Awaited<ReturnType<typeof result.current.updateRol>> | undefined;
        await act(async () => {
            updateResult = await result.current.updateRol('ROLE_ADMIN');
        });

        expect(updateResult?.success).toBe(true);
        expect(result.current.user?.rol).toBe('ROLE_ADMIN');

        // Restaurar estado en el fixture compartido
        await act(async () => {
            await result.current.updateRol('ROLE_CUSTOMER');
        });
    });
});
