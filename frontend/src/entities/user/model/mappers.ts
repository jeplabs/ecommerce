import type { AuthTokenResponse, UserApi } from './schemas/api';
import type { AuthSession, NavbarUserView, UserSessionView } from './types';

export function mapAuthTokenToSession(response: AuthTokenResponse): AuthSession {
    return {
        token: response.token,
        tokenType: response.tipo,
        user: mapAuthTokenToUserView(response),
    };
}

export function mapAuthTokenToUserView(response: AuthTokenResponse): UserSessionView {
    return {
        id: response.id,
        nombre: response.nombre,
        apellido: response.apellido,
        email: response.email,
        rol: response.rol,
    };
}

export function mapUserApiToSessionView(user: UserApi): UserSessionView {
    return {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
    };
}

export function mapUserToNavbarView(
    user: Pick<UserApi, 'nombre' | 'apellido' | 'rol'>
): NavbarUserView {
    const initials = `${(user.nombre || '').charAt(0)}${(user.apellido || '').charAt(0)}`.toUpperCase();
    return {
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        initials: initials || '?',
    };
}

export function isAdminRole(rol: UserApi['rol']): boolean {
    return rol === 'ROLE_ADMIN';
}

export function isCustomerRole(rol: UserApi['rol']): boolean {
    return rol === 'ROLE_CUSTOMER';
}
