import type { CategoryApi } from '@/entities/category/model/schemas/api';

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
