const QPAYPRO_PENDING_ORDER_KEY = 'qpaypro:ordenPendienteId';

export function guardarOrdenQPayProPendiente(ordenId: number): void {
    sessionStorage.setItem(QPAYPRO_PENDING_ORDER_KEY, String(ordenId));
}

export function obtenerOrdenQPayProPendiente(): number | null {
    const raw = sessionStorage.getItem(QPAYPRO_PENDING_ORDER_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function limpiarOrdenQPayProPendiente(): void {
    sessionStorage.removeItem(QPAYPRO_PENDING_ORDER_KEY);
}

