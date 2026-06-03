import { z } from 'zod';

/**
 * Spring serializa `Page` de dos formas según configuración:
 * - Plana (legacy): `totalElements`, `number`, … en la raíz.
 * - VIA_DTO (`@EnableSpringDataWebSupport`): metadata en `page.{ size, number, totalElements, totalPages }`.
 *
 * Este helper normaliza ambas a la forma plana que usa el frontend.
 */
export function normalizeSpringPageRaw(raw: unknown): unknown {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return raw;
    }

    const record = raw as Record<string, unknown>;
    const nested = record.page;

    if (
        nested &&
        typeof nested === 'object' &&
        !Array.isArray(nested) &&
        Array.isArray(record.content) &&
        record.totalElements === undefined
    ) {
        const page = nested as Record<string, unknown>;
        return {
            content: record.content,
            totalElements: page.totalElements,
            totalPages: page.totalPages,
            size: page.size,
            number: page.number,
            first: page.first ?? record.first,
            last: page.last ?? record.last,
            empty: record.empty,
            numberOfElements: record.numberOfElements,
        };
    }

    return raw;
}

/**
 * Page<T> de Spring Data (respuestas paginadas del backend).
 */
export function createSpringPageSchema<T extends z.ZodType>(itemSchema: T) {
    return z.preprocess(
        normalizeSpringPageRaw,
        z.object({
            content: z.array(itemSchema),
            totalElements: z.coerce.number().int().nonnegative(),
            totalPages: z.coerce.number().int().nonnegative(),
            size: z.coerce.number().int().nonnegative(),
            number: z.coerce.number().int().nonnegative(),
            first: z.boolean().optional(),
            last: z.boolean().optional(),
            empty: z.boolean().optional(),
            numberOfElements: z.coerce.number().int().nonnegative().optional(),
        })
    );
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
