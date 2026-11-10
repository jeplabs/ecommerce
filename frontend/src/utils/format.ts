export interface CurrencyConfig {
    codigo: string;
    simbolo: string;
    nombre: string;
    locale: string;
    decimales: number;
}

let activeCurrency: CurrencyConfig = {
    codigo: import.meta.env.VITE_CURRENCY_CODE || 'GTQ',
    simbolo: import.meta.env.VITE_CURRENCY_SYMBOL || 'Q',
    nombre: import.meta.env.VITE_CURRENCY_NAME || 'Quetzal',
    locale: import.meta.env.VITE_CURRENCY_LOCALE || 'es-GT',
    decimales: Number(import.meta.env.VITE_CURRENCY_DECIMALS ?? 2),
};

export function setCurrencyConfig(config: Partial<CurrencyConfig>): void {
    activeCurrency = { ...activeCurrency, ...config };
}

export function getCurrencyConfig(): CurrencyConfig {
    return activeCurrency;
}

export function formatCurrency(value: number | string | null | undefined): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
    if (Number.isNaN(num)) return '—';
    const formattedNumber = new Intl.NumberFormat(activeCurrency.locale, {
        minimumFractionDigits: activeCurrency.decimales,
        maximumFractionDigits: activeCurrency.decimales,
    }).format(num);
    return `${activeCurrency.simbolo} ${formattedNumber}`;
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

export { formatOrderStatus as formatEstadoOrden } from '@/features/checkout/lib/orderMappers';
