import { z } from 'zod';

/**
 * Valida respuesta HTTP con Zod. Lanza ZodError si no coincide con el contrato del backend.
 */
export function parseApi<T>(schema: z.ZodType<T>, data: unknown): T {
    return schema.parse(data);
}

export function safeParseApi<T>(schema: z.ZodType<T>, data: unknown) {
    return schema.safeParse(data);
}
