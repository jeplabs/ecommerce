import { API_URL } from '@/shared/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { ApiError, getErrorMessage, moneySchema, parseApi } from '@/shared';
import { z } from 'zod';
import type { FavoriteProduct } from '../model/types';

export const favoriteProductSchema = z.object({
    productId: z.number(),
    slug: z.string(),
    nombre: z.string(),
    precioVenta: moneySchema,
    moneda: z.string().nullable(),
    imagenUrl: z.string().nullable(),
    guardadoAt: z.string(),
});

const favoriteListSchema = z.array(favoriteProductSchema);

const getToken = () => localStorage.getItem('token');

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

/** {@code GET /api/favoritos} */
export async function fetchFavorites(): Promise<FavoriteProduct[]> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/favoritos`, {
        method: 'GET',
        headers: getAuthHeaders(token),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al cargar los favoritos');
    }

    return parseApi(favoriteListSchema, raw);
}

/** {@code POST /api/favoritos/{productId}} */
export async function addFavorite(productId: number): Promise<FavoriteProduct> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/favoritos/${productId}`, {
        method: 'POST',
        headers: getAuthHeaders(token),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'No se pudo agregar el favorito');
    }

    return parseApi(favoriteProductSchema, raw);
}

/** {@code DELETE /api/favoritos/{productId}} */
export async function removeFavorite(productId: number): Promise<void> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/favoritos/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token, false),
    });

    if (!response.ok) {
        const raw = await readJson(response);
        throwApiError(response, raw, 'No se pudo eliminar el favorito');
    }
}
