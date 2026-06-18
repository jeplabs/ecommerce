import { beforeEach, describe, expect, it } from 'vitest';
import {
    getUsuarioById,
    listUsuarios,
    setUsuarioEstado,
    updateUsuarioRol,
} from './authApi';
import {
    mockAdminAuthTokenResponse,
    mockAdminUser,
    mockUserProfile,
} from '@/test/msw/fixtures/auth';

function seedAdminToken() {
    localStorage.setItem('token', mockAdminAuthTokenResponse.token);
    localStorage.setItem('rol', 'ROLE_ADMIN');
}

describe('authApi (admin)', () => {
    beforeEach(() => {
        seedAdminToken();
    });

    it('listUsuarios devuelve clientes y admins', async () => {
        const users = await listUsuarios();

        expect(users).toHaveLength(2);
        expect(users.some((u) => u.email === mockUserProfile.email)).toBe(true);
        expect(users.some((u) => u.email === mockAdminUser.email)).toBe(true);
    });

    it('getUsuarioById devuelve un usuario', async () => {
        const user = await getUsuarioById(mockUserProfile.id);

        expect(user.email).toBe(mockUserProfile.email);
        expect(user.rol).toBe('ROLE_CUSTOMER');
    });

    it('setUsuarioEstado desactiva y reactiva', async () => {
        const deactivated = await setUsuarioEstado(mockUserProfile.id, false);
        expect(deactivated.activo).toBe(false);

        const reactivated = await setUsuarioEstado(mockUserProfile.id, true);
        expect(reactivated.activo).toBe(true);
    });

    it('updateUsuarioRol cambia el rol', async () => {
        const updated = await updateUsuarioRol(mockUserProfile.id, 'ROLE_ADMIN');

        expect(updated.rol).toBe('ROLE_ADMIN');

        await updateUsuarioRol(mockUserProfile.id, 'ROLE_CUSTOMER');
    });
});
