import { useCategorias } from '@/app/providers';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { ProductCatalog } from '@/widgets/layout/ProductCatalog';
import { useProductosByCategory } from '@/features/catalog';
import { buildCategoryBreadcrumbs } from './lib/category-tree';
import './CategoryProductsView.css';

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
            <div className="container">
                <p>Error al cargar los productos: {error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="container-header">
                <h1>{nombreCategoria || 'Categoría'}</h1>
                <Breadcrumbs items={breadcrumbs} className="container-breadcrumbs" />
            </div>
            <ProductCatalog productosExternos={productos} loadingExterno={loading} />

            {!loading && totalPaginas > 1 && (
                <div
                    className="pagination"
                    style={{
                        marginTop: '2rem',
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                        disabled={paginaActual === 1}
                        className="btn btn-secondary"
                    >
                        Anterior
                    </button>
                    <span style={{ alignSelf: 'center' }}>
                        Página {paginaActual} de {totalPaginas}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                        disabled={paginaActual === totalPaginas}
                        className="btn btn-secondary"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}
