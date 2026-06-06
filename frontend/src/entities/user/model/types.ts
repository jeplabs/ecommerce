import type { UserApi, UserRole } from './schemas/api';

export type { UserApi, UserRole, AuthTokenResponse } from './schemas/api';
export type {
    LoginFormValues,
    RegisterFormValues,
    UpdateProfileFormValues,
    UpdateProfileRequest,
    UpdatePasswordFormValues,
    UpdatePasswordRequest,
    UpdateUserStatusRequest,
    UpdateUserRoleRequest,
} from './schemas/forms';

export {
    userRoleSchema,
    userApiSchema,
    authTokenResponseSchema,
} from './schemas/api';
export {
    loginFormSchema,
    registerFormSchema,
    updateProfileFormSchema,
    updatePasswordFormSchema,
    updateUserStatusRequestSchema,
    updateUserRoleRequestSchema,
    mapRegisterFormToRequest,
    mapLoginFormToRequest,
    mapUpdateProfileFormToRequest,
    mapUpdatePasswordFormToRequest,
} from './schemas/forms';

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
