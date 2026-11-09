import { z } from 'zod';
import { API_URL } from '@/config';
import { getErrorMessage, parseApi } from '@/lib';
import { getAccessToken } from '@/lib/auth-token-store';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import {
    categoryApiSchema,
    type CategoryApi,
    type CreateCategoryRequest,
} from '../types';

const getToken = () =>
    getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const categoryTreeSchema = z.array(categoryApiSchema);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwSessionExpired(): never {
    notifyUnauthorizedIfNeeded(401);
    throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
}

/** {@code GET /api/categorias} — árbol jerárquico completo. */
export async function getAll(): Promise<CategoryApi[]> {
    const response = await fetch(`${API_URL}/api/categorias`);

    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'Error al cargar categorías'));
    }

    return parseApi(categoryTreeSchema, raw);
}

/** {@code POST /api/categorias} */
export async function create(categoriaDatos: CreateCategoryRequest): Promise<CategoryApi> {
    const response = await fetch(`${API_URL}/api/categorias`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(categoriaDatos),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }

    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'No se pudo crear la categoría'));
    }

    return parseApi(categoryApiSchema, raw);
}

export const categoriesApi = {
    getAll,
    create,
};
