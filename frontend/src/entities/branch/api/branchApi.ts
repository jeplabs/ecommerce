import { API_URL } from '@/shared/config';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import { getAccessToken } from '@/shared/lib/auth-token-store';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { branchApiSchema, branchListSchema, type BranchApi } from '../model/schemas/api';
import type { CreateBranchRequest, UpdateBranchRequest } from '../model/schemas/forms';

const getToken = () => getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

/** {@code GET /api/sucursales} (Público — Checkout) */
export async function listar(): Promise<BranchApi[]> {
    const response = await fetch(`${API_URL}/api/sucursales`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al listar sucursales');
    }
    return parseApi(branchListSchema, raw);
}

/** {@code GET /api/sucursales/admin} (Solo ROLE_ADMIN — activas e inactivas) */
export async function listarAdmin(): Promise<BranchApi[]> {
    const response = await fetch(`${API_URL}/api/sucursales/admin`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al listar sucursales (admin)');
    }
    return parseApi(branchListSchema, raw);
}

/** {@code GET /api/sucursales/admin/{id}} (Solo ROLE_ADMIN) */
export async function obtenerAdmin(id: number): Promise<BranchApi> {
    const response = await fetch(`${API_URL}/api/sucursales/admin/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al obtener la sucursal');
    }
    return parseApi(branchApiSchema, raw);
}

/** {@code POST /api/sucursales} (Solo ROLE_ADMIN) */
export async function crearAdmin(datos: CreateBranchRequest): Promise<BranchApi> {
    const response = await fetch(`${API_URL}/api/sucursales`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al crear la sucursal');
    }
    return parseApi(branchApiSchema, raw);
}

/** {@code PATCH /api/sucursales/{id}} (Solo ROLE_ADMIN) */
export async function actualizarAdmin(id: number, datos: UpdateBranchRequest): Promise<BranchApi> {
    const response = await fetch(`${API_URL}/api/sucursales/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    const raw = await response.json().catch(() => ({}));
    if (!response.ok) {
        throwApiError(response, raw, 'Error al actualizar la sucursal');
    }
    return parseApi(branchApiSchema, raw);
}

/** {@code PATCH /api/sucursales/{id}/activar} (Solo ROLE_ADMIN) */
export async function activarAdmin(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/sucursales/${id}/activar`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
    });
    if (!response.ok) {
        const raw = await response.json().catch(() => ({}));
        throwApiError(response, raw, 'Error al activar la sucursal');
    }
}

/** {@code DELETE /api/sucursales/{id}} (Solo ROLE_ADMIN — soft-delete) */
export async function desactivarAdmin(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/sucursales/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken()),
    });
    if (!response.ok) {
        const raw = await response.json().catch(() => ({}));
        throwApiError(response, raw, 'Error al desactivar la sucursal');
    }
}

export const branchApi = {
    listar,
    listarAdmin,
    obtenerAdmin,
    crearAdmin,
    actualizarAdmin,
    activarAdmin,
    desactivarAdmin,
};
