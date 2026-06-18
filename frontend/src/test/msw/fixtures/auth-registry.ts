import type { AuthTokenResponse, UserApi } from '@/entities/user/model/schemas/api';
import { MOCK_ADMIN_EMAIL, MOCK_LOGIN_EMAIL } from './auth';

type DynamicAuthEntry = {
    password: string;
    token: AuthTokenResponse;
};

const dynamicUsers = new Map<string, DynamicAuthEntry>();

export function resetDynamicAuthUsers(): void {
    dynamicUsers.clear();
}

export function createAuthTokenFromUser(user: UserApi): AuthTokenResponse {
    return {
        token: `mock-token-${user.id}-${user.email}`,
        tipo: 'Bearer',
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
    };
}

export function registerDynamicAuthUser(
    email: string,
    password: string,
    user: UserApi
): void {
    dynamicUsers.set(email, {
        password,
        token: createAuthTokenFromUser(user),
    });
}

export function tryDynamicLogin(email: string, password: string): AuthTokenResponse | null {
    const entry = dynamicUsers.get(email);
    if (!entry || entry.password !== password) {
        return null;
    }
    return entry.token;
}

export function isStaticRegisteredEmail(email: string): boolean {
    return email === MOCK_LOGIN_EMAIL || email === MOCK_ADMIN_EMAIL;
}

export function isEmailTaken(email: string): boolean {
    return isStaticRegisteredEmail(email) || dynamicUsers.has(email);
}
