import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { createSpringPageSchema, normalizeSpringPageRaw } from './spring-page';

const itemSchema = z.object({ id: z.number() });

describe('normalizeSpringPageRaw', () => {
    it('devuelve tal cual null, no-objetos y arrays', () => {
        expect(normalizeSpringPageRaw(null)).toBeNull();
        expect(normalizeSpringPageRaw('x')).toBe('x');
        expect(normalizeSpringPageRaw([1, 2])).toEqual([1, 2]);
    });

    it('devuelve tal cual si no hay page anidado', () => {
        const raw = { content: [], totalElements: 0 };
        expect(normalizeSpringPageRaw(raw)).toBe(raw);
    });

    it('devuelve tal cual si totalElements ya está en la raíz', () => {
        const raw = { page: { size: 10 }, content: [], totalElements: 3 };
        expect(normalizeSpringPageRaw(raw)).toBe(raw);
    });

    it('aplana el formato VIA_DTO de Spring', () => {
        const raw = {
            content: [{ id: 1 }],
            page: {
                size: 10,
                number: 0,
                totalElements: 1,
                totalPages: 1,
            },
            first: true,
            last: true,
            empty: false,
            numberOfElements: 1,
        };

        expect(normalizeSpringPageRaw(raw)).toEqual({
            content: [{ id: 1 }],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0,
            first: true,
            last: true,
            empty: false,
            numberOfElements: 1,
        });
    });

    it('usa first/last de la raíz cuando page no los trae', () => {
        const raw = {
            content: [],
            page: { totalElements: 0, totalPages: 0, size: 10, number: 0 },
            first: true,
            last: true,
            empty: true,
            numberOfElements: 0,
        };
        const flat = normalizeSpringPageRaw(raw) as Record<string, unknown>;
        expect(flat.first).toBe(true);
        expect(flat.last).toBe(true);
    });
});

describe('createSpringPageSchema', () => {
    const schema = createSpringPageSchema(itemSchema);

    it('parsea la forma plana', () => {
        const page = schema.parse({
            content: [{ id: 1 }],
            totalElements: 1,
            totalPages: 1,
            size: 10,
            number: 0,
        });
        expect(page.content).toEqual([{ id: 1 }]);
    });

    it('parsea la forma VIA_DTO (preprocess)', () => {
        const page = schema.parse({
            content: [{ id: 1 }],
            page: { totalElements: 1, totalPages: 1, size: 10, number: 0 },
        });
        expect(page.totalElements).toBe(1);
    });

    it('coercea números escritos como strings', () => {
        const page = schema.parse({
            content: [],
            totalElements: '0',
            totalPages: '0',
            size: '10',
            number: '0',
        });
        expect(page.totalElements).toBe(0);
    });

    it('falla con shape inválido', () => {
        expect(() => schema.parse({ content: [{ id: 'no' }] })).toThrow(z.ZodError);
    });
});
