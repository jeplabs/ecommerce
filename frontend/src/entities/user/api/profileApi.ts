import { API_URL } from '@/config/config';
import { getAuthHeaders, isAuthError, notifyUnauthorizedIfNeeded } from '@/utils/apiHelpers';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import { userApiSchema, type UserApi } from '../model/schemas/api';
import type { UpdateProfileFormValues } from '../model/schemas/forms';
import { mapUpdateProfileFormToRequest } from '../model/schemas/forms';

const getToken = () => localStorage.getItem('token');

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

async function handleUserJson(response: Response, fallback: string): Promise<UserApi> {
    const raw = await readJson(response);

    if (!response.ok) {
        notifyUnauthorizedIfNeeded(response.status);
        throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
    }

    return parseApi(userApiSchema, raw);
}

/** {@code GET /api/usuarios/perfil} */
export async function getPerfil(): Promise<UserApi> {
    const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleUserJson(response, 'Error al obtener el perfil');
}

/** {@code PATCH /api/usuarios/perfil} */
export async function updatePerfil(datos: UpdateProfileFormValues): Promise<UserApi> {
    const body = mapUpdateProfileFormToRequest(datos);

    const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(body),
    });
    return handleUserJson(response, 'Error al actualizar el perfil');
}

/** Fachada compatible con el antiguo `profileService`. */
export const profileApi = {
    getPerfil,
    updatePerfil,
    isAuthError,
};

export const profileService = profileApi;
