import { describe, expect, it } from 'vitest';
import { findCategoryByPath } from './category-path';
import { mockCategories } from '@/test/msw/fixtures/categories';

describe('findCategoryByPath', () => {
    it('encuentra categoría raíz por slug', () => {
        const categoria = findCategoryByPath(mockCategories, ['electronica']);
        expect(categoria?.nombre).toBe('Electrónica');
        expect(categoria?.id).toBe(1);
    });

    it('encuentra subcategoría por ruta jerárquica', () => {
        const categoria = findCategoryByPath(mockCategories, ['electronica', 'audio']);
        expect(categoria?.nombre).toBe('Audio');
        expect(categoria?.id).toBe(2);
    });

    it('devuelve null si la ruta no existe', () => {
        expect(findCategoryByPath(mockCategories, ['inexistente'])).toBeNull();
        expect(findCategoryByPath(mockCategories, ['electronica', 'tv'])).toBeNull();
    });
});
