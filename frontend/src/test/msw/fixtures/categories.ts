import type { CategoryApi } from '@/features/catalog';

export const mockCategories: CategoryApi[] = [
    {
        id: 1,
        nombre: 'Electrónica',
        slug: 'electronica',
        parentId: null,
        subcategorias: [
            {
                id: 2,
                nombre: 'Audio',
                slug: 'audio',
                parentId: 1,
                subcategorias: [],
            },
        ],
    },
];
