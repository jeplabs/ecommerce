import { z } from 'zod';
import { positiveIntSchema } from '@/shared/lib/zod-helpers';

/** {@code DatosRespuestaSucursal} */
export const branchApiSchema = z.object({
    id: positiveIntSchema,
    nombre: z.string(),
    direccion: z.string(),
    ciudad: z.string(),
    estado: z.string().nullable().optional(),
    codigoPostal: z.string().nullable().optional(),
    pais: z.string(),
    telefono: z.string(),
    horario: z.string(),
    referencias: z.string().nullable().optional(),
    mapaUrl: z.string().nullable().optional(),
    activo: z.boolean(),
    ordenVisualizacion: z.number().int().nullable().optional(),
    creadoAt: z.string().optional(),
    actualizadoAt: z.string().optional(),
});

export const branchListSchema = z.array(branchApiSchema);

export type BranchApi = z.infer<typeof branchApiSchema>;

