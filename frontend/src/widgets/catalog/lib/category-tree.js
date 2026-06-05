/**
 * Busca una categoría en el árbol por segmentos de slug (ruta /categoria/a/b).
 */
export function findCategoryByPath(arbol, segmentos) {
    if (!segmentos || segmentos.length === 0) return null;
    const [slugActual, ...rest] = segmentos;
    const categoria = arbol.find(
        (c) => c.slug === slugActual || c.id?.toString() === slugActual
    );
    if (!categoria) return null;
    if (rest.length === 0) return categoria;
    return findCategoryByPath(categoria.subcategorias || [], rest);
}

/**
 * Breadcrumbs para página de categoría (Inicio → Catálogo → … → actual).
 */
export function buildCategoryBreadcrumbs(arbolCategorias, segmentos) {
    const breadcrumbs = [
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
export function findCategoryPathInTree(arbol, targetId, currentPath = []) {
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
