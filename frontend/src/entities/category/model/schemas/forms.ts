import { z } from 'zod';

/** {@code DatosCrearCategoria}. */
export const createCategoryRequestSchema = z.object({
    nombre: z.string().min(2).max(100),
    parentId: z.number().int().positive().nullable().optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;
