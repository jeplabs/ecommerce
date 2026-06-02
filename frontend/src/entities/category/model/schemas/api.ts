import { z } from 'zod';
import { positiveIntSchema } from '@/shared/lib/zod-helpers';

export type CategoryApi = {
    id: number;
    nombre: string;
    slug: string;
    parentId?: number | null;
    subcategorias: CategoryApi[];
};

export const categoryApiSchema: z.ZodType<CategoryApi> = z.lazy(() =>
    z.object({
        id: positiveIntSchema,
        nombre: z.string(),
        slug: z.string(),
        parentId: z.number().int().positive().nullable().optional(),
        subcategorias: z.array(categoryApiSchema).default([]),
    })
);
