import type { AuthTokenResponse, UserApi } from '@/entities/user/model/schemas/api';

export const MOCK_LOGIN_EMAIL = 'test@example.com';
export const MOCK_LOGIN_PASSWORD = 'Password1!';

export const mockUserProfile: UserApi = {
    id: 1,
    nombre: 'Test',
    apellido: 'Usuario',
    email: MOCK_LOGIN_EMAIL,
    pais: 'AR',
    rol: 'ROLE_CUSTOMER',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
};

export const mockAuthTokenResponse: AuthTokenResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
    tipo: 'Bearer',
    id: 1,
    nombre: 'Test',
    apellido: 'Usuario',
    email: MOCK_LOGIN_EMAIL,
    rol: 'ROLE_CUSTOMER',
};

export const mockAdminAuthTokenResponse: AuthTokenResponse = {
    ...mockAuthTokenResponse,
    id: 2,
    email: 'admin@example.com',
    rol: 'ROLE_ADMIN',
};
