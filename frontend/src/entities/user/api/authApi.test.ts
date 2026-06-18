import { describe, expect, it } from 'vitest';
import { login, register } from './authApi';
import {
    MOCK_ADMIN_EMAIL,
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    mockAdminAuthTokenResponse,
    mockAuthTokenResponse,
    mockRegisterFormValues,
} from '@/test/msw/fixtures/auth';

describe('authApi.login', () => {
    it('devuelve token de cliente con credenciales válidas (MSW)', async () => {
        const result = await login(MOCK_LOGIN_EMAIL, MOCK_LOGIN_PASSWORD);

        expect(result.token).toBe(mockAuthTokenResponse.token);
        expect(result.email).toBe(MOCK_LOGIN_EMAIL);
        expect(result.rol).toBe('ROLE_CUSTOMER');
    });

    it('devuelve token de admin con credenciales válidas (MSW)', async () => {
        const result = await login(MOCK_ADMIN_EMAIL, MOCK_LOGIN_PASSWORD);

        expect(result.token).toBe(mockAdminAuthTokenResponse.token);
        expect(result.email).toBe(MOCK_ADMIN_EMAIL);
        expect(result.rol).toBe('ROLE_ADMIN');
    });

    it('lanza error con credenciales inválidas', async () => {
        await expect(login('wrong@example.com', 'bad')).rejects.toThrow(
            'Credenciales inválidas'
        );
    });
});

describe('authApi.register', () => {
    it('registra un cliente nuevo (MSW)', async () => {
        const result = await register({
            ...mockRegisterFormValues,
            email: 'registro.unit@example.com',
        });

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.data.email).toBe('registro.unit@example.com');
        expect(result.data.rol).toBe('ROLE_CUSTOMER');
        expect(result.data.activo).toBe(true);
    });

    it('devuelve error si el email ya existe', async () => {
        const result = await register({
            ...mockRegisterFormValues,
            email: MOCK_LOGIN_EMAIL,
        });

        expect(result.ok).toBe(false);
        if (result.ok) return;

        expect(result.data.error).toBe('El email ya está registrado');
    });
});
