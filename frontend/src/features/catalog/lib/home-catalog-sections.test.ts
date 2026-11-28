import { describe, expect, it } from 'vitest';
import { mockProduct } from '@/test/msw/fixtures/products';
import type { CategoryApi } from '../types';
import {
    collectSubtreeIdsAndSlugs,
    DESTACADOS_ROOT_SLUG,
    DESTACADOS_SLUGS,
    findCategoryBySlug,
    matchesCategoryBranch,
    OFERTAS_ROOT_SLUG,
    OFERTAS_SLUGS,
} from './home-catalog-sections';

const mockTree: CategoryApi[] = [
    {
        id: 81,
        nombre: 'Ofertas y más',
        slug: 'ofertas-y-mas',
        parentId: null,
        subcategorias: [
            {
                id: 82,
                nombre: 'Ofertas',
                slug: 'ofertas',
                parentId: 81,
                subcategorias: [
                    {
                        id: 84,
                        nombre: 'Ofertas de temporada',
                        slug: 'ofertas-de-temporada',
                        parentId: 82,
                        subcategorias: [],
                    },
                ],
            },
            {
                id: 83,
                nombre: 'Productos Destacados',
                slug: 'productos-destacados',
                parentId: 81,
                subcategorias: [
                    {
                        id: 87,
                        nombre: 'Los más vendidos',
                        slug: 'los-mas-vendidos',
                        parentId: 83,
                        subcategorias: [],
                    },
                ],
            },
        ],
    },
];

describe('home-catalog-sections', () => {
    it('findCategoryBySlug localiza nodos anidados en cualquier nivel del árbol', () => {
        const destacados = findCategoryBySlug(mockTree, DESTACADOS_ROOT_SLUG);
        expect(destacados?.id).toBe(83);

        const ofertas = findCategoryBySlug(mockTree, OFERTAS_ROOT_SLUG);
        expect(ofertas?.id).toBe(82);

        expect(findCategoryBySlug(mockTree, 'inexistente')).toBeNull();
    });

    it('collectSubtreeIdsAndSlugs recolecta todos los IDs y slugs descendientes de la rama', () => {
        const node = findCategoryBySlug(mockTree, DESTACADOS_ROOT_SLUG);
        const branch = collectSubtreeIdsAndSlugs(node, DESTACADOS_SLUGS);

        expect(branch.ids.has(83)).toBe(true);
        expect(branch.ids.has(87)).toBe(true);
        expect(branch.ids.has(82)).toBe(false);
        expect(branch.slugs.has('los-mas-vendidos')).toBe(true);
    });

    it('matchesCategoryBranch identifica si un producto pertenece a la rama por id, parentId o slug', () => {
        const ofertasBranch = collectSubtreeIdsAndSlugs(
            findCategoryBySlug(mockTree, OFERTAS_ROOT_SLUG),
            OFERTAS_SLUGS
        );

        const prodEnOferta = {
            ...mockProduct,
            categorias: [
                {
                    id: 84,
                    nombre: 'Ofertas de temporada',
                    slug: 'ofertas-de-temporada',
                    parentId: 82,
                    subcategorias: [],
                },
            ],
        };

        const prodNormal = {
            ...mockProduct,
            categorias: [
                {
                    id: 10,
                    nombre: 'Smartphones',
                    slug: 'smartphones',
                    parentId: 2,
                    subcategorias: [],
                },
            ],
        };

        expect(matchesCategoryBranch(prodEnOferta, ofertasBranch)).toBe(true);
        expect(matchesCategoryBranch(prodNormal, ofertasBranch)).toBe(false);
    });
});
