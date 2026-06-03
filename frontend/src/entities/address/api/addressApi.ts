import { z } from 'zod';
import { API_URL } from '@/config/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/utils/apiHelpers';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import { addressApiSchema, type AddressApi } from '../model/schemas/api';
import type { CreateAddressRequest, UpdateAddressRequest } from '../model/schemas/forms';

const getToken = () => localStorage.getItem('token');

const addressListSchema = z.array(addressApiSchema);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

async function handleJson<T>(response: Response, schema: z.ZodType<T>, fallback: string): Promise<T> {
    if (response.status === 204) {
        return null as T;
    }

    const raw = await readJson(response);

    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }

    return parseApi(schema, raw);
}

async function handleVoid(response: Response, fallback: string): Promise<null> {
    if (response.status === 204) {
        return null;
    }

    const raw = await readJson(response);

    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }

    return null;
}

/** {@code GET /api/direcciones} */
export async function listar(): Promise<AddressApi[]> {
    const response = await fetch(`${API_URL}/api/direcciones`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleJson(response, addressListSchema, 'Error al listar direcciones');
}

/** {@code POST /api/direcciones} */
export async function crear(datos: CreateAddressRequest): Promise<AddressApi> {
    const response = await fetch(`${API_URL}/api/direcciones`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    return handleJson(response, addressApiSchema, 'Error al crear la dirección');
}

/** {@code PATCH /api/direcciones/{id} */
export async function actualizar(id: number, datos: UpdateAddressRequest): Promise<AddressApi> {
    const response = await fetch(`${API_URL}/api/direcciones/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    return handleJson(response, addressApiSchema, 'Error al actualizar la dirección');
}

/** {@code PATCH /api/direcciones/{id}/principal */
export async function cambiarPrincipal(id: number): Promise<AddressApi> {
    const response = await fetch(`${API_URL}/api/direcciones/${id}/principal`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
    });
    return handleJson(response, addressApiSchema, 'Error al cambiar la dirección principal');
}

/** {@code DELETE /api/direcciones/{id} */
export async function eliminar(id: number): Promise<null> {
    const response = await fetch(`${API_URL}/api/direcciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken()),
    });
    return handleVoid(response, 'Error al eliminar la dirección');
}

/** Fachada compatible con el antiguo `direccionService`. */
export const addressApi = {
    listar,
    crear,
    actualizar,
    cambiarPrincipal,
    eliminar,
};

export const direccionService = addressApi;
