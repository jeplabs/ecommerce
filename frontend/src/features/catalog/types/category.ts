import { z } from 'zod';
import { positiveIntSchema } from '@/utils/zod-helpers';

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

/** {@code DatosCrearCategoria}. */
export const createCategoryRequestSchema = z.object({
    nombre: z.string().min(2).max(100),
    parentId: z.number().int().positive().nullable().optional(),
});

export type CreateCategoryRequest = z.infer<typeof createCategoryRequestSchema>;

export type CategoryBreadcrumbItem = {
    label: string;
    path?: string | null;
};

export type CategoryBreadcrumbsResult = {
    breadcrumbs: CategoryBreadcrumbItem[];
    categoriaActual: CategoryApi | null;
};
