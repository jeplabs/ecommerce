/**
 * Error HTTP con status y cuerpo del backend (Map de validación o { error: string }).
 */
export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data: unknown = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export function getErrorMessage(data: unknown, fallback = 'Error en la solicitud'): string {
    if (!data || typeof data !== 'object') return fallback;
    const record = data as Record<string, unknown>;
    if (typeof record.error === 'string') return record.error;
    if (typeof record.message === 'string') return record.message;
    const first = Object.values(record).find((v) => typeof v === 'string');
    return typeof first === 'string' ? first : fallback;
}
