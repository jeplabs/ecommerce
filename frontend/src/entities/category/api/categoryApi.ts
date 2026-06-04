import { z } from 'zod';
import { API_URL } from '@/shared/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { getErrorMessage, parseApi } from '@/shared';
import { categoryApiSchema, type CategoryApi } from '../model/schemas/api';
import type { CreateCategoryRequest } from '../model/schemas/forms';

const getToken = () => localStorage.getItem('token');

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

export const categoryApi = {
    getAll,
    create,
};