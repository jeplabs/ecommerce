import type { UserApi } from '@/entities/user/model/schemas/api';
import { MOCK_LOGIN_PASSWORD, mockUserProfile } from './auth';

let profile: UserApi = { ...mockUserProfile };

export function resetDynamicProfile() {
    profile = { ...mockUserProfile };
}

export function getDynamicProfile(): UserApi {
    return { ...profile };
}

export function updateDynamicProfile(
    partial: Pick<UserApi, 'nombre' | 'apellido' | 'pais'>
): UserApi {
    profile = { ...profile, ...partial };
    return { ...profile };
}

export function updateDynamicPassword(
    passwordActual: string,
    _passwordNueva: string
): { mensaje: string } {
    if (passwordActual !== MOCK_LOGIN_PASSWORD) {
        throw new Error('Contraseña actual incorrecta');
    }

    return { mensaje: 'Contraseña actualizada correctamente' };
}
