/**
 * Alineado con {@code EstadoOrden.puedeTransicionarA} y {@code Orden.cancelar} en el backend.
 * CANCELADA solo es alcanzable desde PENDIENTE o CONFIRMADA vía cancelar().
 */
export const ADMIN_ESTADOS_SIGUIENTES = {
    PENDIENTE: ['CONFIRMADA', 'CANCELADA'],
    CONFIRMADA: ['EN_PROCESO', 'CANCELADA'],
    EN_PROCESO: ['ENVIADA'],
    ENVIADA: ['ENTREGADA'],
    ENTREGADA: [],
    CANCELADA: [],
};

/**
 * Valores para el {@code <select>} de edición: estado actual más destinos permitidos (sin duplicados).
 */
export function getOpcionesEstadoAdmin(estadoActual) {
    const siguientes = ADMIN_ESTADOS_SIGUIENTES[estadoActual] || [];
    return [...new Set([estadoActual, ...siguientes])];
}

/** Filtro opcional en GET /api/ordenes/admin?estado= */
export const ORDEN_ESTADOS_FILTRO = [
    { value: '', label: 'Todos los estados' },
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'EN_PROCESO', label: 'En proceso' },
    { value: 'ENVIADA', label: 'Enviada' },
    { value: 'ENTREGADA', label: 'Entregada' },
    { value: 'CANCELADA', label: 'Cancelada' },
];
