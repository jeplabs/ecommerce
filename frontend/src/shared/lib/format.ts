export { formatOrderStatus as formatEstadoOrden } from '@/entities/order';

export function formatCurrency(value: number | string | null | undefined): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    if (Number.isNaN(num)) return '—';
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(num);
}

export function formatDateTime(isoString: string | null | undefined): string {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(isoString));
}

export function getInitials(nombre?: string | null, apellido?: string | null): string {
    const n = (nombre || '').charAt(0);
    const a = (apellido || '').charAt(0);
    return `${n}${a}`.toUpperCase() || '?';
}