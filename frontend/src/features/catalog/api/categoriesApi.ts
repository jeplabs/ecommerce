import { z } from 'zod';
import { API_URL } from '@/config';
import { ApiError, getErrorMessage, parseApi } from '@/lib';
import { fetchWithAuth, getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import {
    categoryApiSchema,
    type CategoryApi,
    type CreateCategoryRequest,
} from '../types';

const categoryTreeSchema = z.array(categoryApiSchema);

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

/** {@code GET /api/categorias} — árbol jerárquico completo. */
export async function getAll(): Promise<CategoryApi[]> {
    const response = await fetch(`${API_URL}/api/categorias`);

    const raw = await readJson(response);
    if (!response.ok) {
        throw new ApiError(getErrorMessage(raw, 'Error al cargar categorías'), response.status, raw);
    }

    return parseApi(categoryTreeSchema, raw);
}

/** {@code POST /api/categorias} */
export async function create(categoriaDatos: CreateCategoryRequest): Promise<CategoryApi> {
    const response = await fetchWithAuth(`${API_URL}/api/categorias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoriaDatos),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'No se pudo crear la categoría');
    }

    return parseApi(categoryApiSchema, raw);
}

/** {@code PATCH /api/categorias/{id}} */
export async function update(
    id: number,
    categoriaDatos: CreateCategoryRequest
): Promise<CategoryApi> {
    const response = await fetchWithAuth(`${API_URL}/api/categorias/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoriaDatos),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'No se pudo actualizar la categoría');
    }

    return parseApi(categoryApiSchema, raw);
}

/** {@code DELETE /api/categorias/{id}} */
export async function deleteCategory(id: number): Promise<void> {
    const response = await fetchWithAuth(`${API_URL}/api/categorias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(undefined, false),
    });

    if (!response.ok) {
        const raw = await readJson(response);
        throwApiError(response, raw, 'No se pudo eliminar la categoría');
    }
}

export const categoriesApi = {
    getAll,
    create,
    update,
    deleteCategory,
};
