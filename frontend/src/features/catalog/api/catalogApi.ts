import { API_URL } from '@/config';
import { getErrorMessage, parseApi } from '@/lib';
import { productPageSchema, type ProductPage } from '../types';

const catalogoCache = new Map<string, { data: ProductPage; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de caché en memoria

export function invalidateCatalogoCache(): void {
    catalogoCache.clear();
}

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

async function handleProductPageJson(response: Response, fallback: string): Promise<ProductPage> {
    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(getErrorMessage(raw, fallback));
    }
    return parseApi(productPageSchema, raw);
}

/** {@code GET /api/productos?...} — Retorna la página completa de catálogo con facetas. */
export async function getCatalogo(
    params?: URLSearchParams | string,
    options?: { forceFresh?: boolean }
): Promise<ProductPage> {
    const query = params ? (typeof params === 'string' ? params : params.toString()) : '';
    const cacheKey = query;
    const now = Date.now();

    if (!options?.forceFresh && catalogoCache.has(cacheKey)) {
        const cached = catalogoCache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
    }

    const url = `${API_URL}/api/productos${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    const data = await handleProductPageJson(response, 'Error al cargar productos del catálogo');
    catalogoCache.set(cacheKey, { data, timestamp: now });
    return data;
}

export const catalogApi = {
    getCatalogo,
    invalidateCatalogoCache,
};
