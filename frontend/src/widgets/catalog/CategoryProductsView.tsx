import { useEffect } from 'react';
import { useCategorias } from '@/app/providers';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Pagination } from '@/shared/ui';
import { ProductCatalog } from '@/widgets/layout/ProductCatalog';
import { useProductosByCategory } from '@/features/catalog';
import { buildCategoryBreadcrumbs } from './lib/category-tree';
import styles from './CatalogShell.module.css';

type CategoryProductsViewProps = {
    slugPath: string;
    segmentos: string[];
};

export default function CategoryProductsView({ slugPath, segmentos }: CategoryProductsViewProps) {
    const {
        productos,
        loading,
        error,
        paginaActual,
        setPaginaActual,
        totalPaginas,
    } = useProductosByCategory(slugPath);
    const { arbolCategorias } = useCategorias();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [paginaActual]);

    const { breadcrumbs, categoriaActual } = buildCategoryBreadcrumbs(
        arbolCategorias,
        segmentos
    );
    const nombreCategoria = categoriaActual
        ? categoriaActual.nombre
        : segmentos.length === 0
          ? 'Categorías'
          : 'Categoría';

    if (error) {
        return (
            <div className={styles.container}>
                <p>Error al cargar los productos: {error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{nombreCategoria || 'Categoría'}</h1>
                <Breadcrumbs items={breadcrumbs} className={styles.breadcrumbsSlot} />
            </div>
            <ProductCatalog productosExternos={productos} loadingExterno={loading} />

            {!loading && totalPaginas > 1 && (
                <Pagination
                    currentPage={paginaActual}
                    totalPages={totalPaginas}
                    onPageChange={setPaginaActual}
                />
            )}
        </div>
    );
}
