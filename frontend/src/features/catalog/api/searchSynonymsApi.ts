import { z } from 'zod';
import { API_URL } from '@/config';
import { ApiError, getErrorMessage, parseApi } from '@/lib';
import { fetchWithAuth, getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import {
    searchSynonymApiSchema,
    type SaveSearchSynonymRequest,
    type SearchSynonymApi,
} from '../types';
import { invalidateCatalogoCache } from './catalogApi';

const BASE_URL = `${API_URL}/api/admin/busqueda/sinonimos`;
const searchSynonymListSchema = z.array(searchSynonymApiSchema);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    const defaultMsg =
        response.status === 401
            ? 'Sesión expirada. Por favor inicia sesión nuevamente.'
            : fallback;
    throw new ApiError(getErrorMessage(raw, defaultMsg), response.status, raw);
}

/** {@code GET /api/admin/busqueda/sinonimos} */
export async function getAll(): Promise<SearchSynonymApi[]> {
    const response = await fetchWithAuth(BASE_URL, {
        method: 'GET',
        headers: getAuthHeaders(undefined, false),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al cargar los grupos de sinónimos');
    }

    return parseApi(searchSynonymListSchema, raw);
}

/** {@code GET /api/admin/busqueda/sinonimos/{id}} */
export async function getById(id: number): Promise<SearchSynonymApi> {
    const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(undefined, false),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Grupo de sinónimos no encontrado');
    }

    return parseApi(searchSynonymApiSchema, raw);
}

/** {@code POST /api/admin/busqueda/sinonimos} */
export async function create(payload: SaveSearchSynonymRequest): Promise<SearchSynonymApi> {
    const response = await fetchWithAuth(BASE_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'No se pudo crear el grupo de sinónimos');
    }

    invalidateCatalogoCache();
    return parseApi(searchSynonymApiSchema, raw);
}

/** {@code PUT /api/admin/busqueda/sinonimos/{id}} */
export async function update(
    id: number,
    payload: SaveSearchSynonymRequest
): Promise<SearchSynonymApi> {
    const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'No se pudo actualizar el grupo de sinónimos');
    }

    invalidateCatalogoCache();
    return parseApi(searchSynonymApiSchema, raw);
}

/** {@code PATCH /api/admin/busqueda/sinonimos/{id}/estado} */
export async function toggleStatus(id: number): Promise<SearchSynonymApi> {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(undefined, false),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'No se pudo cambiar el estado del grupo de sinónimos');
    }

    invalidateCatalogoCache();
    return parseApi(searchSynonymApiSchema, raw);
}

/** {@code DELETE /api/admin/busqueda/sinonimos/{id}} */
export async function remove(id: number): Promise<void> {
    const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(undefined, false),
    });

    if (!response.ok) {
        const raw = await readJson(response);
        throwApiError(response, raw, 'No se pudo eliminar el grupo de sinónimos');
    }

    invalidateCatalogoCache();
}

export const searchSynonymsApi = {
    getAll,
    getById,
    create,
    update,
    toggleStatus,
    remove,
};
