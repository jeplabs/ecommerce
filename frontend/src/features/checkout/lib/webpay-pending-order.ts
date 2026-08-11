const PENDING_ORDER_KEY = 'webpay:ordenPendienteId';

export function guardarOrdenWebpayPendiente(ordenId: number): void {
    sessionStorage.setItem(PENDING_ORDER_KEY, String(ordenId));
}

export function obtenerOrdenWebpayPendiente(): number | null {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function limpiarOrdenWebpayPendiente(): void {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
}

export function parsearOrdenIdDesdeTbk(tbkOrdenCompra: string | null): number | null {
    if (!tbkOrdenCompra) return null;

    const directo = Number(tbkOrdenCompra);
    if (Number.isFinite(directo) && directo > 0) return directo;

    const segmentos = tbkOrdenCompra.split('-');
    if (segmentos[0] === 'ORD' && segmentos[1]) {
        const id = Number(segmentos[1]);
        if (Number.isFinite(id) && id > 0) return id;
    }

    return null;
}
