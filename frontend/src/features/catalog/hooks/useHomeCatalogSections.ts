import { useEffect, useMemo, useState } from 'react';
import { categoriesApi } from '../api/categoriesApi';
import { productsApi } from '../api/productsApi';
import {
    collectSubtreeIdsAndSlugs,
    DESTACADOS_ROOT_SLUG,
    DESTACADOS_SLUGS,
    findCategoryBySlug,
    matchesCategoryBranch,
    OFERTAS_ROOT_SLUG,
    OFERTAS_SLUGS,
} from '../lib/home-catalog-sections';
import type { CategoryApi, ProductApi } from '../types';

const DEFAULT_HOME_SECTION_SIZE = 24;

export type UseHomeCatalogSectionsResult = {
    productosDestacados: ProductApi[];
    productosOfertas: ProductApi[];
    loadingSections: boolean;
};

/**
 * Hook de dominio que resuelve los productos de las secciones "Productos destacados"
 * y "Ofertas" del Home combinando la consulta directa por rama de categoría al backend
 * con el filtrado reactivo en memoria.
 */
export function useHomeCatalogSections(
    productosEnMemoria: ProductApi[] = [],
    sectionSize = DEFAULT_HOME_SECTION_SIZE
): UseHomeCatalogSectionsResult {
    const [treeCategories, setTreeCategories] = useState<CategoryApi[]>([]);
    const [remoteDestacados, setRemoteDestacados] = useState<ProductApi[] | null>(null);
    const [remoteOfertas, setRemoteOfertas] = useState<ProductApi[] | null>(null);
    const [loadingSections, setLoadingSections] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        setLoadingSections(true);

        categoriesApi
            .getAll()
            .then(async (tree) => {
                if (!isMounted || !Array.isArray(tree)) return;
                setTreeCategories(tree);

                const destacadosCat = findCategoryBySlug(tree, DESTACADOS_ROOT_SLUG);
                const ofertasCat = findCategoryBySlug(tree, OFERTAS_ROOT_SLUG);

                const [destacadosPage, ofertasPage] = await Promise.all([
                    destacadosCat
                        ? productsApi
                              .getByCategory(destacadosCat.id, 0, sectionSize)
                              .catch(() => null)
                        : Promise.resolve(null),
                    ofertasCat
                        ? productsApi
                              .getByCategory(ofertasCat.id, 0, sectionSize)
                              .catch(() => null)
                        : Promise.resolve(null),
                ]);

                if (!isMounted) return;
                if (destacadosPage && Array.isArray(destacadosPage.content)) {
                    setRemoteDestacados(destacadosPage.content);
                }
                if (ofertasPage && Array.isArray(ofertasPage.content)) {
                    setRemoteOfertas(ofertasPage.content);
                }
            })
            .catch(() => {
                // Si falla la carga de categorías, opera con el filtrado en memoria por slugs conocidos
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingSections(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [sectionSize]);

    const destacadosBranch = useMemo(() => {
        const node = findCategoryBySlug(treeCategories, DESTACADOS_ROOT_SLUG);
        return collectSubtreeIdsAndSlugs(node, DESTACADOS_SLUGS);
    }, [treeCategories]);

    const ofertasBranch = useMemo(() => {
        const node = findCategoryBySlug(treeCategories, OFERTAS_ROOT_SLUG);
        return collectSubtreeIdsAndSlugs(node, OFERTAS_SLUGS);
    }, [treeCategories]);

    const productosDestacados = useMemo<ProductApi[]>(() => {
        const localMatches = (productosEnMemoria || []).filter((p) =>
            matchesCategoryBranch(p, destacadosBranch)
        );
        if (remoteDestacados && remoteDestacados.length > 0) {
            return remoteDestacados;
        }
        return localMatches;
    }, [productosEnMemoria, destacadosBranch, remoteDestacados]);

    const productosOfertas = useMemo<ProductApi[]>(() => {
        const localMatches = (productosEnMemoria || []).filter((p) =>
            matchesCategoryBranch(p, ofertasBranch)
        );
        if (remoteOfertas && remoteOfertas.length > 0) {
            return remoteOfertas;
        }
        return localMatches;
    }, [productosEnMemoria, ofertasBranch, remoteOfertas]);

    return {
        productosDestacados,
        productosOfertas,
        loadingSections,
    };
}
