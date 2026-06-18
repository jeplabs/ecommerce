import type { AuthTokenResponse, UserApi } from '@/entities/user/model/schemas/api';
import type { RegisterFormValues } from '@/entities/user/model/schemas/forms';

export const MOCK_LOGIN_EMAIL = 'test@example.com';
export const MOCK_ADMIN_EMAIL = 'admin@example.com';
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

export const mockAdminUser: UserApi = {
    id: 2,
    nombre: 'Admin',
    apellido: 'Sistema',
    email: MOCK_ADMIN_EMAIL,
    pais: 'AR',
    rol: 'ROLE_ADMIN',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
};

export const mockUsersList: UserApi[] = [mockUserProfile, mockAdminUser];

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
    nombre: 'Admin',
    apellido: 'Sistema',
    email: MOCK_ADMIN_EMAIL,
    rol: 'ROLE_ADMIN',
};

export function createMockRegisteredUser(
    payload: Pick<RegisterFormValues, 'nombre' | 'apellido' | 'pais' | 'email'>,
    id = 99
): UserApi {
    return {
        id,
        nombre: payload.nombre,
        apellido: payload.apellido,
        email: payload.email,
        pais: payload.pais,
        rol: 'ROLE_CUSTOMER',
        activo: true,
        bloqueado: false,
        intentosFallidos: 0,
    };
}

export function isRegisteredEmail(email: string): boolean {
    return email === MOCK_LOGIN_EMAIL || email === MOCK_ADMIN_EMAIL;
}

export const mockRegisterFormValues: RegisterFormValues = {
    nombre: 'Nuevo',
    apellido: 'Cliente',
    pais: 'Argentina',
    email: 'nuevo.cliente@example.com',
    password: MOCK_LOGIN_PASSWORD,
    confirmarPassword: MOCK_LOGIN_PASSWORD,
};
