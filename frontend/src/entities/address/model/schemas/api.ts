import { z } from 'zod';
import { positiveIntSchema } from '@/shared/lib/zod-helpers';

/** {@code DatosRespuestaDireccion}. */
export const addressApiSchema = z.object({
    id: positiveIntSchema,
    alias: z.string(),
    direccion: z.string(),
    ciudad: z.string(),
    estado: z.string(),
    codigoPostal: z.string().nullable().optional(),
    pais: z.string(),
    telefono: z.string(),
    referencias: z.string().nullable().optional(),
    principal: z.boolean(),
    activo: z.boolean(),
});

export type AddressApi = z.infer<typeof addressApiSchema>;
