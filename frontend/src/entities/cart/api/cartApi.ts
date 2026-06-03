import { API_URL } from '@/config/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import { cartApiSchema, type CartApi } from '../model/schemas/api';
import type { AddCartItemRequest, UpdateCartItemQuantityRequest } from '../model/schemas/forms';

const getToken = () => localStorage.getItem('token');

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

async function handleCartJson(response: Response, fallback: string): Promise<CartApi> {
    const raw = await readJson(response);

    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }

    return parseApi(cartApiSchema, raw);
}

/** {@code GET /api/carrito} */
export async function getCart(): Promise<CartApi> {
    const response = await fetch(`${API_URL}/api/carrito`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });
    return handleCartJson(response, 'Error al obtener carrito');
}

/** {@code POST /api/carrito/items} */
export async function addToCart(productId: number, quantity = 1): Promise<CartApi> {
    const body: AddCartItemRequest = { productoId: productId, cantidad: quantity };
    const response = await fetch(`${API_URL}/api/carrito/items`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(body),
    });
    return handleCartJson(response, 'Error al agregar');
}

/** Variante tipada con {@code DatosAgregarItem}. */
export async function addCartItem(body: AddCartItemRequest): Promise<CartApi> {
    const response = await fetch(`${API_URL}/api/carrito/items`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(body),
    });
    return handleCartJson(response, 'Error al agregar');
}

/** {@code PATCH /api/carrito/items/{itemId}} */
export async function updateItemQuantity(itemId: number, quantity: number): Promise<CartApi> {
    const body: UpdateCartItemQuantityRequest = { cantidad: quantity };
    const response = await fetch(`${API_URL}/api/carrito/items/${itemId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(body),
    });
    return handleCartJson(response, 'Error al actualizar');
}

/** {@code DELETE /api/carrito/items/{itemId}} */
export async function removeItem(itemId: number): Promise<CartApi> {
    const response = await fetch(`${API_URL}/api/carrito/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken()),
    });
    return handleCartJson(response, 'Error al eliminar');
}

/** {@code DELETE /api/carrito} */
export async function clearCart(): Promise<CartApi> {
    const response = await fetch(`${API_URL}/api/carrito`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken()),
    });
    return handleCartJson(response, 'Error al limpiar');
}

export const cartApi = {
    getCart,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearCart,
};