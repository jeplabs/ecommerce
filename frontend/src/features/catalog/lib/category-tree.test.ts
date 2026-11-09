import { describe, expect, it } from 'vitest';
import { buildCategoryBreadcrumbs, findCategoryPathInTree } from './category-tree';
import type { CategoryApi } from '../types';

const mockArbol: CategoryApi[] = [
    {
        id: 1,
        nombre: 'Electrónica',
        slug: 'electronica',
        subcategorias: [
            {
                id: 2,
                nombre: 'Audio',
                slug: 'audio',
                subcategorias: [
                    {
                        id: 3,
                        nombre: 'Audífonos',
                        slug: 'audifonos',
                        subcategorias: [],
                    },
                ],
            },
        ],
    },
];

describe('category-tree', () => {
    it('buildCategoryBreadcrumbs construye la lista de breadcrumbs por segmentos', () => {
        const { breadcrumbs, categoriaActual } = buildCategoryBreadcrumbs(mockArbol, [
            'electronica',
            'audio',
        ]);

        expect(categoriaActual?.nombre).toBe('Audio');
        expect(breadcrumbs).toHaveLength(4);
        expect(breadcrumbs[0]).toEqual({ label: 'Inicio', path: '/' });
        expect(breadcrumbs[1]).toEqual({ label: 'Catálogo', path: '/catalogo' });
        expect(breadcrumbs[2]).toEqual({ label: 'Electrónica', path: '/categoria/electronica' });
        expect(breadcrumbs[3]).toEqual({ label: 'Audio', path: null });
    });

    it('findCategoryPathInTree encuentra la jerarquía completa padre-hijo', () => {
        const path = findCategoryPathInTree(mockArbol, 'audifonos');
        expect(path).not.toBeNull();
        expect(path?.map((c) => c.nombre)).toEqual(['Electrónica', 'Audio', 'Audífonos']);
    });

    it('findCategoryPathInTree devuelve null si no existe', () => {
        const path = findCategoryPathInTree(mockArbol, 'no-existe');
        expect(path).toBeNull();
    });
});
