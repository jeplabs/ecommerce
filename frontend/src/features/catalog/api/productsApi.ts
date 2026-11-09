import { API_URL } from '@/config';
import { ApiError, getErrorMessage, parseApi } from '@/lib';
import { getAccessToken } from '@/lib/auth-token-store';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import {
    productApiSchema,
    type ProductApi,
    type ProductPage,
} from '../types';
import { getCatalogo } from './catalogApi';

const getToken = () =>
    getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

function throwSessionExpired(): never {
    notifyUnauthorizedIfNeeded(401);
    throw new Error('Sesión expirada');
}

async function handleProductJson(response: Response, fallback: string): Promise<ProductApi> {
    if (response.status === 401) {
        throwSessionExpired();
    }
    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }
    return parseApi(productApiSchema, raw);
}

/** {@code GET /api/productos/slug/{slug}} */
export async function getBySlug(slug: string): Promise<ProductApi> {
    const response = await fetch(`${API_URL}/api/productos/slug/${encodeURIComponent(slug)}`, {
        headers: getAuthHeaders(getToken(), false),
    });
    return handleProductJson(response, 'Producto no encontrado');
}

/** {@code GET /api/productos/{id}} */
export async function getById(id: number): Promise<ProductApi> {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
        headers: getAuthHeaders(getToken(), false),
    });
    return handleProductJson(response, 'Producto no encontrado');
}

/** {@code GET /api/productos?categoriaId&page&size} */
export async function getByCategory(
    categoriaId: number,
    page = 0,
    size = 12
): Promise<ProductPage> {
    const params = new URLSearchParams({
        categoriaId: String(categoriaId),
        page: String(page),
        size: String(size),
    });

    return getCatalogo(params);
}

/** {@code GET /api/productos?page&size} */
export async function getAll(page = 0, size = 100): Promise<ProductApi[]> {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    const pageData = await getCatalogo(params);
    return pageData.content;
}

export const productsApi = {
    getById,
    getBySlug,
    getAll,
    getByCategory,
};
