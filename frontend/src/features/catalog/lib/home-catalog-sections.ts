import type { CategoryApi, ProductApi } from '../types';

export const DESTACADOS_ROOT_SLUG = 'productos-destacados';
export const OFERTAS_ROOT_SLUG = 'ofertas';

export const DESTACADOS_SLUGS = new Set<string>([
    DESTACADOS_ROOT_SLUG,
    'los-mas-vendidos',
    'novedades',
    'recomendados-de-la-tienda',
]);

export const OFERTAS_SLUGS = new Set<string>([
    OFERTAS_ROOT_SLUG,
    'ofertas-de-temporada',
    'packs-y-kits',
    'liquidacion',
]);

export type CategoryBranchMatcher = {
    ids: Set<number>;
    slugs: Set<string>;
};

/**
 * Busca recursivamente un nodo de categoría por su slug en el árbol jerárquico.
 */
export function findCategoryBySlug(
    nodes: CategoryApi[],
    targetSlug: string
): CategoryApi | null {
    for (const node of nodes) {
        if (node.slug === targetSlug) {
            return node;
        }
        if (node.subcategorias && node.subcategorias.length > 0) {
            const found = findCategoryBySlug(node.subcategorias, targetSlug);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Recolecta todos los IDs y slugs de un subárbol de categoría junto con una lista base de slugs conocidos.
 */
export function collectSubtreeIdsAndSlugs(
    node: CategoryApi | null,
    fallbackSlugs: Set<string>
): CategoryBranchMatcher {
    const ids = new Set<number>();
    const slugs = new Set<string>(fallbackSlugs);

    function traverse(current: CategoryApi | null) {
        if (!current) return;
        ids.add(current.id);
        if (current.slug) slugs.add(current.slug);
        if (current.subcategorias && current.subcategorias.length > 0) {
            for (const child of current.subcategorias) {
                traverse(child);
            }
        }
    }

    traverse(node);
    return { ids, slugs };
}

/**
 * Determina si un producto pertenece a una rama jerárquica de categorías (por ID directo, parentId o slug).
 */
export function matchesCategoryBranch(
    product: ProductApi,
    branch: CategoryBranchMatcher
): boolean {
    if (!product.categorias || product.categorias.length === 0) return false;
    return product.categorias.some(
        (cat) =>
            branch.ids.has(cat.id) ||
            (cat.parentId != null && branch.ids.has(cat.parentId)) ||
            branch.slugs.has(cat.slug)
    );
}
