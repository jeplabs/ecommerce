import { describe, expect, it } from 'vitest';
import { profileApi } from './profileApi';
import {
    MOCK_LOGIN_PASSWORD,
    mockAuthTokenResponse,
    mockUserProfile,
} from '@/test/msw/fixtures/auth';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

describe('profileApi', () => {
    it('getPerfil devuelve el perfil del usuario', async () => {
        seedAuth();

        const perfil = await profileApi.getPerfil();

        expect(perfil.email).toBe(mockUserProfile.email);
        expect(perfil.nombre).toBe('Test');
    });

    it('updatePerfil actualiza nombre y apellido', async () => {
        seedAuth();

        const perfil = await profileApi.updatePerfil({
            nombre: 'María',
            apellido: 'López',
            pais: 'CL',
        });

        expect(perfil.nombre).toBe('María');
        expect(perfil.apellido).toBe('López');
    });

    it('updatePassword devuelve mensaje con contraseña correcta', async () => {
        seedAuth();

        const result = await profileApi.updatePassword({
            passwordActual: MOCK_LOGIN_PASSWORD,
            password: 'NuevaPass1!',
            confirmarPassword: 'NuevaPass1!',
        });

        expect(result.mensaje).toMatch(/actualizada/i);
    });

    it('updatePassword falla con contraseña actual incorrecta', async () => {
        seedAuth();

        await expect(
            profileApi.updatePassword({
                passwordActual: 'incorrecta',
                password: 'NuevaPass1!',
                confirmarPassword: 'NuevaPass1!',
            })
        ).rejects.toThrow('Contraseña actual incorrecta');
    });
});
