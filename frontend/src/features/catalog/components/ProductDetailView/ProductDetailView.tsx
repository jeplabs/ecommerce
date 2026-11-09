import { useCategorias, useCart } from '@/app/providers';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@/shared/ui/Button';
import { formatCurrency } from '@/utils/format';
import type { CategoryBreadcrumbItem } from '../../types';
import { useProductDetail } from '../../hooks/useProductDetail';
import { findCategoryPathInTree } from '../../lib/category-tree';
import { ProductGallery } from '../ProductGallery/ProductGallery';
import { ProductInfo } from '../ProductInfo/ProductInfo';
import { ProductTabs } from '../ProductTabs/ProductTabs';
import styles from './ProductDetailView.module.css';

export type ProductDetailViewProps = {
    slug: string;
    onBackHome: () => void;
};

export function ProductDetailView({ slug, onBackHome }: ProductDetailViewProps) {
    const { arbolCategorias } = useCategorias();
    const { addToCart } = useCart();
    const { producto, loading } = useProductDetail(slug);

    if (loading && !producto) {
        return <div className={styles.loadingContainer}>Cargando producto...</div>;
    }

    if (!producto) {
        return (
            <div className={styles.errorContainer}>
                <h2>Producto no encontrado</h2>
                <Button type="button" variant="primary" onClick={onBackHome}>
                    Volver al inicio
                </Button>
            </div>
        );
    }

    const breadcrumbs: CategoryBreadcrumbItem[] = [
        { label: 'Inicio', path: '/' },
        { label: 'Catálogo', path: '/catalogo' },
    ];

    const categoriaProducto =
        producto.categorias && producto.categorias.length > 0
            ? producto.categorias[producto.categorias.length - 1]
            : null;

    if (categoriaProducto && arbolCategorias) {
        const rutaCompleta = findCategoryPathInTree(
            arbolCategorias,
            categoriaProducto.id || categoriaProducto.slug
        );

        if (rutaCompleta) {
            rutaCompleta.forEach((cat, index) => {
                const pathSegmentos = rutaCompleta
                    .slice(0, index + 1)
                    .map((c) => c.slug || c.id);
                breadcrumbs.push({
                    label: cat.nombre,
                    path: `/categoria/${pathSegmentos.join('/')}`,
                });
            });
        } else {
            producto.categorias.forEach((cat) => {
                breadcrumbs.push({
                    label: cat.nombre,
                    path: `/categoria/${cat.slug || cat.id}`,
                });
            });
        }
    }

    breadcrumbs.push({ label: producto.nombre, path: null });

    const precioFormateado = formatCurrency(producto.precioVenta);

    return (
        <div className={styles.container}>
            <Breadcrumbs items={breadcrumbs} />
            <div className={styles.mainGrid}>
                <ProductGallery key={producto.id} producto={producto} />
                <ProductInfo
                    producto={producto}
                    precioFormateado={precioFormateado}
                    onAddToCart={addToCart}
                />
            </div>
            <ProductTabs producto={producto} />
        </div>
    );
}

export default ProductDetailView;
