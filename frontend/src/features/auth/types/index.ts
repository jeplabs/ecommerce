import { z } from 'zod';
import { positiveIntSchema } from '@/utils/zod-helpers';

/** Alineado a {@code Rol} del backend (valor JSON: ROLE_ADMIN | ROLE_CUSTOMER). */
export const userRoleSchema = z.enum(['ROLE_ADMIN', 'ROLE_CUSTOMER']);

/** {@code DatosRespuestaUsuario}. */
export const userApiSchema = z.object({
    id: positiveIntSchema,
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    pais: z.string(),
    rol: userRoleSchema,
    activo: z.boolean(),
    bloqueado: z.boolean(),
    intentosFallidos: z.number().int().nonnegative(),
});

/** {@code DatosRespuestaToken} — respuesta de login. */
export const authTokenResponseSchema = z.object({
    token: z.string(),
    tipo: z.string(),
    id: positiveIntSchema,
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email(),
    rol: userRoleSchema,
});

export type UserApi = z.infer<typeof userApiSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type AuthTokenResponse = z.infer<typeof authTokenResponseSchema>;

/** {@code DatosLogin}. */
export const loginFormSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

/** {@code DatosRegistro}. */
export const registerFormSchema = z
    .object({
        nombre: z.string().min(2).max(100),
        apellido: z.string().min(2).max(100),
        pais: z.string().min(2).max(100),
        email: z.string().email(),
        password: z.string().min(8, 'Mínimo 8 caracteres'),
        confirmarPassword: z.string().min(1, 'Confirma la contraseña'),
    })
    .refine((data) => data.password === data.confirmarPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmarPassword'],
    });

/** {@code DatosActualizarEstadoUsuario}. */
export const updateUserStatusRequestSchema = z.object({
    activo: z.boolean(),
});

/** {@code DatosActualizarRol} — admin. */
export const updateUserRoleRequestSchema = z.object({
    rol: z.enum(['ROLE_ADMIN', 'ROLE_CUSTOMER']),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type UpdateUserStatusRequest = z.infer<typeof updateUserStatusRequestSchema>;
export type UpdateUserRoleRequest = z.infer<typeof updateUserRoleRequestSchema>;

export function mapRegisterFormToRequest(values: RegisterFormValues) {
    return {
        nombre: values.nombre.trim(),
        apellido: values.apellido.trim(),
        pais: values.pais.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmarPassword: values.confirmarPassword,
    };
}

export function mapLoginFormToRequest(values: LoginFormValues) {
    return {
        email: values.email.trim(),
        password: values.password,
    };
}

/** Estado de sesión en el cliente (view model). */
export type AuthSession = {
    token: string;
    tokenType: string;
    user: UserSessionView;
};

export type UserSessionView = {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: UserRole;
};

export type NavbarUserView = {
    nombre: string;
    apellido: string;
    rol: UserRole;
    initials: string;
};

export type AdminUserRowView = UserApi;

export type UserListFilters = {
    search?: string;
    rol?: UserRole;
    activo?: boolean;
};

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
