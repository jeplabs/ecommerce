import { API_URL } from '@/shared/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import { orderApiSchema, bankAccountApiSchema, type OrderApi, type OrderStatus, type BancoAccountApi } from '../model/schemas/api';
import { orderPageSchema, type OrderPage } from '../model/types';
import type { CreateOrderRequest } from '../model/schemas/forms';
import z from 'zod';

const getToken = () => localStorage.getItem('token');

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

async function handleOrderJson(response: Response, fallback: string): Promise<OrderApi> {
    const raw = await readJson(response);

    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }

    return parseApi(orderApiSchema, raw);
}

async function handleOrderPageJson(response: Response, fallback: string): Promise<OrderPage> {
    const raw = await readJson(response);

    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }

    return parseApi(orderPageSchema, raw);
}

async function handleBankAccountsJson(response: Response, fallback: string) {
    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }
    return parseApi(z.array(bankAccountApiSchema), raw);
}

export type ListOrdersAdminParams = {
    page?: number;
    size?: number;
    estado?: OrderStatus;
};

/** {@code GET /api/ordenes} */
export async function listarMisOrdenes(page = 0, size = 10): Promise<OrderPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    const response = await fetch(`${API_URL}/api/ordenes?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleOrderPageJson(response, 'Error al listar órdenes');
}

/** {@code GET /api/ordenes/{id} */
export async function obtenerOrden(id: number): Promise<OrderApi> {
    const response = await fetch(`${API_URL}/api/ordenes/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleOrderJson(response, 'Error al obtener la orden');
}

/** {@code PATCH /api/ordenes/{id}/cancelar */
export async function cancelarOrden(id: number): Promise<OrderApi> {
    const response = await fetch(`${API_URL}/api/ordenes/${id}/cancelar`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
    });
    return handleOrderJson(response, 'Error al cancelar la orden');
}

/** {@code POST /api/ordenes} */
export async function crearOrden(body: CreateOrderRequest): Promise<OrderApi> {
    const response = await fetch(`${API_URL}/api/ordenes`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({
            direccionId: body.direccionId,
            servicioEnvioId: body.servicioEnvioId,
            formaPago: body.formaPago,
            metodoPago: body.metodoPago,
            notas: body.notas ?? null,
        }),
    });
    return handleOrderJson(response, 'Error al crear la orden');
}

export async function subirComprobanteOrder(
    ordenId: number,
    archivo: File
): Promise<OrderApi> {
    const token = getToken();
    if (!token) {
        throw new ApiError('No se ha autenticado', 401, null);
    }

    const formData = new FormData();
    formData.append('archivo', archivo);

    const response = await fetch(`${API_URL}/api/ordenes/${ordenId}/comprobante`, {
        method: 'POST',
        headers: getAuthHeaders(token, false),
        body: formData,
    });

    return handleOrderJson(response, 'Error al subir el comprobante');
}


/** {@code GET /api/ordenes/admin} */
export async function listarOrdenesAdmin({
    page = 0,
    size = 10,
    estado,
}: ListOrdersAdminParams = {}): Promise<OrderPage> {
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    if (estado) {
        params.set('estado', estado);
    }
    const response = await fetch(`${API_URL}/api/ordenes/admin?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleOrderPageJson(response, 'Error al listar órdenes (admin)');
}

/** {@code GET /api/ordenes/admin/{id} */
export async function obtenerOrdenAdmin(id: number): Promise<OrderApi> {
    const response = await fetch(`${API_URL}/api/ordenes/admin/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleOrderJson(response, 'Error al obtener la orden (admin)');
}

/** {@code PATCH /api/ordenes/admin/{id}/estado */
export async function actualizarEstadoOrdenAdmin(
    id: number,
    estado: OrderStatus
): Promise<OrderApi> {
    const response = await fetch(`${API_URL}/api/ordenes/admin/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({ estado }),
    });
    return handleOrderJson(response, 'Error al actualizar el estado de la orden');
}

/** {@code GET /api/bancos/account} */
export async function listarCuentasBancarias(): Promise<BancoAccountApi[]> {
    const response = await fetch(`${API_URL}/api/banco`, {
        method: 'GET',
        headers: getAuthHeaders(getToken())
    });
    return handleBankAccountsJson(response, 'Error al listar los bancos de cuentas');
}

export const orderApi = {
    listarMisOrdenes,
    obtenerOrden,
    cancelarOrden,
    crearOrden,
    listarOrdenesAdmin,
    obtenerOrdenAdmin,
    actualizarEstadoOrdenAdmin,
};