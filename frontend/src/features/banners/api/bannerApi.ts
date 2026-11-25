import { API_URL } from '@/config';
import { ApiError, getErrorMessage, parseApi } from '@/lib';
import { getAccessToken } from '@/lib/auth-token-store';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import {
    bannerApiSchema,
    bannerListSchema,
    type BannerApi,
    type BannerSection,
    type CreateBannerRequest,
    type UpdateBannerRequest,
} from '../types';

const getToken = () =>
    getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

/** {@code GET /api/banners?seccion={seccion}} (Público — Home) */
export async function listarVigentes(
    seccion: BannerSection = 'HERO_CAROUSEL'
): Promise<BannerApi[]> {
    const url = new URL(`${API_URL}/api/banners`);
    url.searchParams.set('seccion', seccion);

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al listar banners vigentes');
    }
    return parseApi(bannerListSchema, raw);
}

/** {@code GET /api/banners/admin} (Solo ROLE_ADMIN — todos los banners) */
export async function listarAdmin(seccion?: BannerSection): Promise<BannerApi[]> {
    const url = new URL(`${API_URL}/api/banners/admin`);
    if (seccion) {
        url.searchParams.set('seccion', seccion);
    }

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al listar banners (admin)');
    }
    return parseApi(bannerListSchema, raw);
}

/** {@code GET /api/banners/admin/{id}} (Solo ROLE_ADMIN) */
export async function obtenerAdmin(id: number): Promise<BannerApi> {
    const response = await fetch(`${API_URL}/api/banners/admin/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al obtener el banner');
    }
    return parseApi(bannerApiSchema, raw);
}

/** {@code POST /api/banners} (Solo ROLE_ADMIN) */
export async function crearAdmin(datos: CreateBannerRequest): Promise<BannerApi> {
    const response = await fetch(`${API_URL}/api/banners`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al crear el banner');
    }
    return parseApi(bannerApiSchema, raw);
}

/** {@code PUT /api/banners/{id}} (Solo ROLE_ADMIN) */
export async function actualizarAdmin(
    id: number,
    datos: UpdateBannerRequest
): Promise<BannerApi> {
    const response = await fetch(`${API_URL}/api/banners/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al actualizar el banner');
    }
    return parseApi(bannerApiSchema, raw);
}

/** {@code PATCH /api/banners/{id}/estado} (Solo ROLE_ADMIN — toggle activo/inactivo) */
export async function toggleEstadoAdmin(id: number): Promise<BannerApi> {
    const response = await fetch(`${API_URL}/api/banners/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al cambiar estado del banner');
    }
    return parseApi(bannerApiSchema, raw);
}

/** {@code PUT /api/banners/reordenar} (Solo ROLE_ADMIN — reordenar 1..N) */
export async function reordenarAdmin(bannerIds: number[]): Promise<BannerApi[]> {
    const response = await fetch(`${API_URL}/api/banners/reordenar`, {
        method: 'PUT',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({ bannerIds }),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al reordenar banners');
    }
    return parseApi(bannerListSchema, raw);
}

/** {@code DELETE /api/banners/{id}} (Solo ROLE_ADMIN — eliminación física) */
export async function eliminarAdmin(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/banners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken()),
    });
    if (!response.ok) {
        const raw = await response.json().catch(() => ({}));
        throwApiError(response, raw, 'Error al eliminar el banner');
    }
}
