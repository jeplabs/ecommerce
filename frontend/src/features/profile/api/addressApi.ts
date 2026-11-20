import { getAccessToken } from '@/lib/auth-token-store';
import { z } from 'zod';
import { API_URL } from '@/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import { ApiError, getErrorMessage, parseApi } from '@/lib';
import {
    addressApiSchema,
    type AddressApi,
    type CreateAddressRequest,
    type UpdateAddressRequest,
} from '../types/address';

const getToken = () => getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

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
export async function listarDirecciones(): Promise<AddressApi[]> {
    const response = await fetch(`${API_URL}/api/direcciones`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleJson(response, addressListSchema, 'Error al listar direcciones');
}

/** {@code POST /api/direcciones} */
export async function crearDireccion(datos: CreateAddressRequest): Promise<AddressApi> {
    const response = await fetch(`${API_URL}/api/direcciones`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    return handleJson(response, addressApiSchema, 'Error al crear la dirección');
}

/** {@code PATCH /api/direcciones/{id} */
export async function actualizarDireccion(id: number, datos: UpdateAddressRequest): Promise<AddressApi> {
    const response = await fetch(`${API_URL}/api/direcciones/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(datos),
    });
    return handleJson(response, addressApiSchema, 'Error al actualizar la dirección');
}

/** {@code PATCH /api/direcciones/{id}/principal */
export async function cambiarDireccionPrincipal(id: number): Promise<AddressApi> {
    const response = await fetch(`${API_URL}/api/direcciones/${id}/principal`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
    });
    return handleJson(response, addressApiSchema, 'Error al cambiar la dirección principal');
}

/** {@code DELETE /api/direcciones/{id} */
export async function eliminarDireccion(id: number): Promise<null> {
    const response = await fetch(`${API_URL}/api/direcciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken()),
    });
    return handleVoid(response, 'Error al eliminar la dirección');
}

export const addressApi = {
    listar: listarDirecciones,
    crear: crearDireccion,
    actualizar: actualizarDireccion,
    cambiarPrincipal: cambiarDireccionPrincipal,
    eliminar: eliminarDireccion,
};
