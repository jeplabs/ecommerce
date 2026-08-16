import { API_URL } from '@/shared/config';
import {
    getAuthHeaders,
    notifyUnauthorizedIfNeeded,
} from '@/shared/lib/http-session';
import { ApiError, getErrorMessage, parseApi } from '@/shared';
import {
    webpayConfirmResponseSchema,
    webpayEstadoSchema,
    webpayInitResponseSchema,
    type WebpayConfirmResponse,
    type WebpayInitResult,
    type WebpayEstadoSchema,
} from '../model/schemas/payment';

const getToken = () => localStorage.getItem('token');

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

/** {@code POST /api/pagos/webpay/iniciar} */
export async function iniciarWebpay(params: {
    ordenId: number;
}): Promise<WebpayInitResult> {
    const response = await fetch(`${API_URL}/api/pagos/webpay/iniciar`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({
            ordenId: params.ordenId,
        }),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al iniciar el pago Webpay');
    }

    return parseApi(webpayInitResponseSchema, raw);
}

/** {@code POST /api/pagos/webpay/confirmar} */
export async function confirmarWebpay(tokenWs: string): Promise<WebpayConfirmResponse> {
    const response = await fetch(`${API_URL}/api/pagos/webpay/confirmar`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({ token_ws: tokenWs }),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al confirmar el pago Webpay');
    }

    return parseApi(webpayConfirmResponseSchema, raw);
}

/** {@code GET /api/pagos/webpay/confirmar?TBK_TOKEN=...} — marca la transacción ABORTADA en backend. */
export async function notificarAbortada(tbkToken: string): Promise<void> {
    const response = await fetch(
        `${API_URL}/api/pagos/webpay/confirmar?TBK_TOKEN=${encodeURIComponent(tbkToken)}`,
        { method: 'GET', headers: getAuthHeaders(getToken()) }
    );

    if (!response.ok) {
        throwApiError(response, await readJson(response), 'Error al notificar pago abandonado');
    }
}

/**
 * {@code GET /api/pagos/webpay/confirmar?TBK_ID_SESION=...&TBK_ORDEN_COMPRA=...}
 * Marca la transacción como TIMEOUT en backend cuando el pago expiró en Webpay.
 * En el retorno por timeout Transbank NO envía token, solo TBK_ID_SESION/TBK_ORDEN_COMPRA.
 */
export async function notificarTimeout(
    tbkIdSesion: string,
    tbkOrdenCompra?: string
): Promise<void> {
    const params = new URLSearchParams();
    params.set('TBK_ID_SESION', tbkIdSesion);
    if (tbkOrdenCompra) params.set('TBK_ORDEN_COMPRA', tbkOrdenCompra);

    const response = await fetch(
        `${API_URL}/api/pagos/webpay/confirmar?${params.toString()}`,
        { method: 'GET', headers: getAuthHeaders(getToken()) }
    );

    if (!response.ok) {
        throwApiError(response, await readJson(response), 'Error al notificar pago con timeout');
    }
}

/** {@code GET /api/pagos/webpay/estado/{ordenId}} */
export async function consultarEstadoWebpay(ordenId: number): Promise<WebpayEstadoSchema> {
    const response = await fetch(`${API_URL}/api/pagos/webpay/estado/${ordenId}`, {
        method: 'GET',
        headers: getAuthHeaders(getToken()),
    });

    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, 'Error al consultar el estado del pago Webpay');
    }

    return parseApi(webpayEstadoSchema, raw);
}

export const paymentGatewayApi = {
    iniciarWebpay,
    confirmarWebpay,
    notificarAbortada,
    notificarTimeout,
    consultarEstadoWebpay
};