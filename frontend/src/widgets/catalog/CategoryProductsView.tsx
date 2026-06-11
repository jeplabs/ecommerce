import { useCategorias } from '@/app/providers';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@/shared/ui/Button';
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
                <div className={styles.pagination}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                        disabled={paginaActual === 1}
                    >
                        Anterior
                    </Button>
                    <span className={styles.paginationInfo}>
                        Página {paginaActual} de {totalPaginas}
                    </span>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                        disabled={paginaActual === totalPaginas}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
}
