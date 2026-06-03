import type { CategoryApi } from './schemas/api';

export type { CategoryApi } from './schemas/api';
export type { CreateCategoryRequest } from './schemas/forms';
export { createCategoryRequestSchema } from './schemas/forms';

export type CategoryTreeNode = {
    id: number;
    nombre: string;
    slug: string;
    parentId?: number | null;
    subcategorias: CategoryTreeNode[];
};

export function mapCategoryApiToTree(node: CategoryApi): CategoryTreeNode {
    return {
        id: node.id,
        nombre: node.nombre,
        slug: node.slug,
        parentId: node.parentId,
        subcategorias: node.subcategorias.map(mapCategoryApiToTree),
    };
}
