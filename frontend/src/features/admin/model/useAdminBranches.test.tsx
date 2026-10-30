import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { AppProviders } from '@/app/providers/AppProviders';
import { useAdminBranches } from './useAdminBranches';
import { mockAdminAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { resetDynamicBranches } from '@/test/msw/fixtures/branches-registry';

function createWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <MemoryRouter initialEntries={['/admin/sucursales']}>
                <AppProviders>{children}</AppProviders>
            </MemoryRouter>
        );
    };
}

function seedAdminToken() {
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('useAdminBranches', () => {
    beforeEach(() => {
        resetDynamicBranches();
        seedAdminToken();
    });

    it('carga todas las sucursales para el panel de administración', async () => {
        const { result } = renderHook(() => useAdminBranches(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.branches.length).toBeGreaterThanOrEqual(2);
        expect(result.current.error).toBeNull();
    });

    it('crea una nueva sucursal exitosamente', async () => {
        const { result } = renderHook(() => useAdminBranches(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        let res: { success: boolean; branch?: unknown } | undefined;
        await act(async () => {
            res = await result.current.crearSucursal({
                nombre: 'Tienda Las Américas',
                direccion: 'Avenida Las Américas 10-20',
                ciudad: 'Ciudad de Guatemala',
                pais: 'GT',
                telefono: '+502 2400-5555',
                horario: 'Lun-Sáb: 10:00-19:00',
            });
        });

        expect(res?.success).toBe(true);
        expect(result.current.branches.some((b) => b.nombre === 'Tienda Las Américas')).toBe(true);
    });

    it('actualiza una sucursal existente', async () => {
        const { result } = renderHook(() => useAdminBranches(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const target = result.current.branches[0];
        expect(target).toBeDefined();

        await act(async () => {
            await result.current.actualizarSucursal(target.id, {
                nombre: 'Tienda Centro Renovada',
            });
        });

        const updated = result.current.branches.find((b) => b.id === target.id);
        expect(updated?.nombre).toBe('Tienda Centro Renovada');
    });

    it('activa y desactiva una sucursal', async () => {
        const { result } = renderHook(() => useAdminBranches(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const target = result.current.branches[0];
        expect(target.activo).toBe(true);

        // Desactivar
        await act(async () => {
            await result.current.desactivarSucursal(target.id);
        });

        let current = result.current.branches.find((b) => b.id === target.id);
        expect(current?.activo).toBe(false);

        // Activar
        await act(async () => {
            await result.current.activarSucursal(target.id);
        });

        current = result.current.branches.find((b) => b.id === target.id);
        expect(current?.activo).toBe(true);
    });
});

