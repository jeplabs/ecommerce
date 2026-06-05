import { z } from 'zod';
import { API_URL } from '@/shared/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import {
    authTokenResponseSchema,
    userApiSchema,
    type AuthTokenResponse,
    type UserApi,
    type UserRole,
} from '../model/schemas/api';
import type { LoginFormValues, RegisterFormValues } from '../model/schemas/forms';
import { mapLoginFormToRequest, mapRegisterFormToRequest } from '../model/schemas/forms';

const getToken = () => localStorage.getItem('token');

const userListSchema = z.array(userApiSchema);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

async function handleAuthenticatedJson<T>(
    response: Response,
    schema: z.ZodType<T>
): Promise<T> {
    const raw = await readJson(response);

    if (!response.ok) {
        notifyUnauthorizedIfNeeded(response.status);
        throw new ApiError(getErrorMessage(raw), response.status, raw);
    }

    return parseApi(schema, raw);
}

/** {@code POST /api/auth/login} */
export async function login(email: string, password: string): Promise<AuthTokenResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const raw = await readJson(response);

    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'Error en el login'));
    }

    return parseApi(authTokenResponseSchema, raw);
}

/** Variante tipada desde valores de formulario. */
export async function loginWithForm(values: LoginFormValues): Promise<AuthTokenResponse> {
    const body = mapLoginFormToRequest(values);
    return login(body.email, body.password);
}

export type RegisterResult =
    | { ok: true; data: UserApi }
    | { ok: false; data: Record<string, unknown> };

/** {@code POST /api/auth/register} */
export async function register(userData: RegisterFormValues): Promise<RegisterResult> {
    const body = mapRegisterFormToRequest(userData);

    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const raw = await readJson(response);
    const data =
        raw && typeof raw === 'object' && !Array.isArray(raw)
            ? (raw as Record<string, unknown>)
            : { error: getErrorMessage(raw) };

    if (!response.ok) {
        return { ok: false, data };
    }

    return { ok: true, data: parseApi(userApiSchema, raw) };
}

/** {@code GET /api/auth/usuarios} — solo ADMIN. */
export async function listUsuarios(): Promise<UserApi[]> {
    const response = await fetch(`${API_URL}/api/auth/usuarios`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleAuthenticatedJson(response, userListSchema);
}

/** {@code PATCH /api/auth/usuarios/{id}/estado} */
export async function setUsuarioEstado(id: number, activo: boolean): Promise<UserApi> {
    const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({ activo }),
    });
    return handleAuthenticatedJson(response, userApiSchema);
}

/** {@code GET /api/auth/usuarios/{id} */
export async function getUsuarioById(id: number): Promise<UserApi> {
    const response = await fetch(`${API_URL}/api/auth/usuarios/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleAuthenticatedJson(response, userApiSchema);
}

/** {@code PATCH /api/auth/usuarios/{id}/rol} */
export async function updateUsuarioRol(id: number, rol: UserRole): Promise<UserApi> {
    const response = await fetch(`${API_URL}/api/auth/usuarios/${id}/rol`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({ rol }),
    });
    return handleAuthenticatedJson(response, userApiSchema);
}

/** {@code POST /api/auth/forgot-password} */
export async function forgotPassword(email: string): Promise<{ mensaje: string }> {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const raw = await readJson(response);

    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'Error al solicitar recuperación de contraseña'));
    }

    return raw as { mensaje: string };
}

/** {@code POST /api/auth/reset-password} */
export async function resetPassword(
    token: string,
    password: string,
    confirmarPassword: string
): Promise<{ mensaje: string }> {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmarPassword }),
    });

    const raw = await readJson(response);

    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'Error al restablecer contraseña'));
    }

    return raw as { mensaje: string };
}

export const authApi = {
    login,
    register,
    listUsuarios,
    setUsuarioEstado,
    getUsuarioById,
    updateUsuarioRol,
    forgotPassword,
    resetPassword,
};