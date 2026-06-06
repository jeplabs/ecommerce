import type { CategoryApi } from '@/entities/category';
import { findCategoryByPath } from '@/features/catalog/lib/category-path';

export type CategoryBreadcrumbItem = {
    label: string;
    path?: string | null;
};

export type CategoryBreadcrumbsResult = {
    breadcrumbs: CategoryBreadcrumbItem[];
    categoriaActual: CategoryApi | null;
};

export { findCategoryByPath };

/**
 * Breadcrumbs para página de categoría (Inicio → Catálogo → … → actual).
 */
export function buildCategoryBreadcrumbs(
    arbolCategorias: CategoryApi[],
    segmentos: string[]
): CategoryBreadcrumbsResult {
    const breadcrumbs: CategoryBreadcrumbItem[] = [
        { label: 'Inicio', path: '/' },
        { label: 'Catálogo', path: '/catalogo' },
    ];

    const categoriaActual = findCategoryByPath(arbolCategorias, segmentos);
    if (categoriaActual && segmentos.length > 0) {
        let rutaAcumulada = '';
        segmentos.forEach((slug, index) => {
            rutaAcumulada += `/${slug}`;
            const catEnNivel = findCategoryByPath(
                arbolCategorias,
                segmentos.slice(0, index + 1)
            );
            if (catEnNivel) {
                const esUltimo = index === segmentos.length - 1;
                breadcrumbs.push({
                    label: catEnNivel.nombre,
                    path: esUltimo ? null : `/categoria${rutaAcumulada}`,
                });
            }
        });
    }

    return { breadcrumbs, categoriaActual };
}

/**
 * Ruta completa padre → hijo para breadcrumbs de detalle de producto.
 */
export function findCategoryPathInTree(
    arbol: CategoryApi[],
    targetId: number | string,
    currentPath: CategoryApi[] = []
): CategoryApi[] | null {
    for (const cat of arbol) {
        if (cat.id === targetId || cat.slug === targetId) {
            return [...currentPath, cat];
        }
        if (cat.subcategorias?.length > 0) {
            const resultado = findCategoryPathInTree(
                cat.subcategorias,
                targetId,
                [...currentPath, cat]
            );
            if (resultado) return resultado;
        }
    }
    return null;
}
