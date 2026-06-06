import type { CategoryApi } from '@/entities/category';

/**
 * Busca una categoría en el árbol por segmentos de slug (ruta jerárquica).
 */
export function findCategoryByPath(
    arbol: CategoryApi[],
    segmentos: string[]
): CategoryApi | null {
    if (!segmentos?.length) return null;
    const [slugActual, ...rest] = segmentos;
    const categoria = arbol.find(
        (c) => c.slug === slugActual || c.id?.toString() === slugActual
    );
    if (!categoria) return null;
    if (rest.length === 0) return categoria;
    return findCategoryByPath(categoria.subcategorias ?? [], rest);
}
