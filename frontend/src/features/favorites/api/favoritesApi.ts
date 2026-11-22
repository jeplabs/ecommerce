import { getAccessToken } from '@/lib/auth-token-store';
import { API_URL } from '@/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import { ApiError, getErrorMessage, parseApi, createSpringPageSchema } from '@/lib';
import { moneySchema } from '@/utils';
import { z } from 'zod';
import type { FavoritePage, FavoriteProduct } from '../types';

export const favoriteProductSchema = z.object({
    productId: z.number(),
    slug: z.string().optional().default(''),
    nombre: z.string(),
    precioVenta: moneySchema,
    moneda: z.string().nullable().optional(),
    imagenUrl: z.string().nullable().optional(),
    guardadoAt: z.string().nullable().optional(),
});

export const favoritePageSchema = createSpringPageSchema(favoriteProductSchema);
export const favoriteIdsSchema = z.array(z.number());

const getToken = () =>
    getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

/** {@code GET /api/favoritos/ids} — Array ligero de IDs para íconos en catálogo/tarjetas. */
export async function fetchFavoriteIds(): Promise<number[]> {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/favoritos/ids`, {
        method: 'GET',
        headers: getAuthHeaders(token),
    });

    // Fallback de transición: si el backend local no ha sido reiniciado y devuelve 404 para /ids
    if (response.status === 404) {
        const fallbackPage = await fetchFavorites(0, 100);
        return fallbackPage.content.map((f) => f.productId);
    }

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al cargar IDs de favoritos');
    }

    return parseApi(favoriteIdsSchema, raw);
}

/** {@code GET /api/favoritos?page=&size=&sort=} — Página de productos favoritos. */
export async function fetchFavorites(
    page = 0,
    size = 12,
    sort = 'creadoAt,desc'
): Promise<FavoritePage> {
    const token = getToken();
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        sort,
    });

    const response = await fetch(`${API_URL}/api/favoritos?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(token),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al cargar los favoritos');
    }

    // Compatibilidad defensiva: si el backend en ejecución aún devuelve un array plano
    if (Array.isArray(raw)) {
        const start = page * size;
        const paged = raw.slice(start, start + size);
        const normalized = {
            content: paged,
            totalElements: raw.length,
            totalPages: Math.max(1, Math.ceil(raw.length / size)),
            size,
            number: page,
            first: page === 0,
            last: start + size >= raw.length,
            empty: paged.length === 0,
            numberOfElements: paged.length,
        };
        return parseApi(favoritePageSchema, normalized);
    }

    return parseApi(favoritePageSchema, raw);
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

export const favoritesApi = {
    fetchFavoriteIds,
    fetchFavorites,
    addFavorite,
    removeFavorite,
};
