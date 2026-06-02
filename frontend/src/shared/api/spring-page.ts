import { z } from 'zod';

/**
 * Page<T> de Spring Data (respuestas paginadas del backend).
 */
export function createSpringPageSchema<T extends z.ZodType>(itemSchema: T) {
    return z.object({
        content: z.array(itemSchema),
        totalElements: z.number().int().nonnegative(),
        totalPages: z.number().int().nonnegative(),
        size: z.number().int().nonnegative(),
        number: z.number().int().nonnegative(),
        first: z.boolean().optional(),
        last: z.boolean().optional(),
        empty: z.boolean().optional(),
        numberOfElements: z.number().int().nonnegative().optional(),
    });
}

export type SpringPage<T> = {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
    numberOfElements?: number;
};
