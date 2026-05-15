const ESTADO_ORDEN_LABELS = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    EN_PROCESO: 'En proceso',
    ENVIADA: 'Enviada',
    ENTREGADA: 'Entregada',
    CANCELADA: 'Cancelada',
};

export const formatEstadoOrden = (estado) =>
    ESTADO_ORDEN_LABELS[estado] || estado;

export const formatCurrency = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(num);
};

export const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(isoString));
};

export const getInitials = (nombre, apellido) => {
    const n = (nombre || '').charAt(0);
    const a = (apellido || '').charAt(0);
    return `${n}${a}`.toUpperCase() || '?';
};
