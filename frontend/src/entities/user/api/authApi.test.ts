import { describe, expect, it } from 'vitest';
import { login } from './authApi';
import {
    MOCK_LOGIN_EMAIL,
    MOCK_LOGIN_PASSWORD,
    mockAuthTokenResponse,
} from '@/test/msw/fixtures/auth';

describe('authApi.login', () => {
    it('devuelve token con credenciales válidas (MSW)', async () => {
        const result = await login(MOCK_LOGIN_EMAIL, MOCK_LOGIN_PASSWORD);

        expect(result.token).toBe(mockAuthTokenResponse.token);
        expect(result.email).toBe(MOCK_LOGIN_EMAIL);
        expect(result.rol).toBe('ROLE_CUSTOMER');
    });

    it('lanza error con credenciales inválidas', async () => {
        await expect(login('wrong@example.com', 'bad')).rejects.toThrow(
            'Credenciales inválidas'
        );
    });
});
