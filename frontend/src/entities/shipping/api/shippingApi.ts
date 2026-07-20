import { API_URL } from '@/shared/config';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/shared/lib/http-session';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import {
    shippingOptionsApiSchema,
    type ShippingOptionsApi,
} from '../model/schemas/api';

const getToken = () => localStorage.getItem('token');

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

/** {@code GET /api/envio/opciones?subtotal=&formaPagoEnvio=} — requiere JWT de cliente. */
export async function getOpciones(
    subtotal = 0,
    formaPagoEnvio: 'EN_LINEA' | 'CONTRA_ENTREGA' = 'EN_LINEA'
): Promise<ShippingOptionsApi> {
    const normalized = Math.max(0, Number(subtotal) || 0);
    const params = new URLSearchParams({
        subtotal: String(normalized),
        formaPagoEnvio,
    });

    const response = await fetch(`${API_URL}/api/envio/opciones?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });

    const raw = await readJson(response);

    if (!response.ok) {
        notifyUnauthorizedIfNeeded(response.status);
        throw new ApiError(
            getErrorMessage(raw, 'Error al cargar opciones de envío'),
            response.status,
            raw
        );
    }

    return parseApi(shippingOptionsApiSchema, raw);
}

export const shippingApi = {
    getOpciones,
};