import { z } from 'zod';
import { localDateTimeSchema, positiveIntSchema } from '@/utils/zod-helpers';

/**
 * Normaliza un término de sinónimo igual que {@code ProductoBuscador.normalizarTerminoSinonimo} en backend:
 * remueve diacríticos (NFD), pasa a minúsculas y conserva solo caracteres alfanuméricos.
 */
export function normalizeSynonymTerm(termino: string): string {
    return termino
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '');
}

/** {@code DatosRespuestaBusquedaSinonimo} — GET/POST/PUT/PATCH /api/admin/busqueda/sinonimos */
export const searchSynonymApiSchema = z.object({
    id: positiveIntSchema,
    nombreGrupo: z.string(),
    terminos: z.array(z.string()),
    activo: z.boolean(),
    createdAt: localDateTimeSchema,
    updatedAt: localDateTimeSchema,
});

export type SearchSynonymApi = z.infer<typeof searchSynonymApiSchema>;

/** {@code DatosCrearBusquedaSinonimo} / {@code DatosActualizarBusquedaSinonimo} */
export const saveSearchSynonymRequestSchema = z.object({
    nombreGrupo: z
        .string()
        .trim()
        .min(2, 'El nombre del grupo debe tener entre 2 y 100 caracteres')
        .max(100, 'El nombre del grupo debe tener entre 2 y 100 caracteres'),
    terminos: z
        .array(z.string().trim().min(2, 'Cada término debe tener al menos 2 caracteres'))
        .min(2, 'Un grupo de sinónimos debe incluir al menos 2 términos'),
    activo: z.boolean().optional(),
});

export type SaveSearchSynonymRequest = z.infer<typeof saveSearchSynonymRequestSchema>;
