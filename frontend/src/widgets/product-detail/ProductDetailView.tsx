import { useProduct, useCategorias, useCart } from '@/app/providers';
import { useState, useEffect } from 'react';
import type { ProductApi } from '@/entities/product';
import Breadcrumbs from '@/shared/ui/Breadcrumbs/Breadcrumbs';
import { Button } from '@/shared/ui/Button';
import type { CategoryBreadcrumbItem } from '@/widgets/catalog/lib/category-tree';
import ProductGallery from '@/widgets/product-detail/ProductGallery/ProductGallery';
import ProductInfo from '@/widgets/product-detail/ProductInfo/ProductInfo';
import ProductTabs from '@/widgets/product-detail/ProductTabs/ProductTabs';
import { findCategoryPathInTree } from '@/widgets/catalog/lib/category-tree';
import styles from './ProductDetailView.module.css';

type ProductDetailViewProps = {
    slug: string;
    onBackHome: () => void;
};

export default function ProductDetailView({ slug, onBackHome }: ProductDetailViewProps) {
    const { productos, loading } = useProduct();
    const { arbolCategorias } = useCategorias();
    const { addToCart } = useCart();

    const [producto, setProducto] = useState<ProductApi | null>(null);

    useEffect(() => {
        if (productos?.length > 0 && slug) {
            const encontrado = productos.find(
                (p) => p.slug === slug || p.id === parseInt(slug, 10)
            );
            if (encontrado) {
                setProducto(encontrado);
            }
        }
    }, [slug, productos]);

    if (loading) {
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
        producto.categorias?.length > 0
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

    const precioFormateado = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: producto.moneda || 'CLP',
    }).format(producto.precioVenta);

    return (
        <div className={styles.container}>
            <Breadcrumbs items={breadcrumbs} />
            <div className={styles.mainGrid}>
                <ProductGallery producto={producto} />
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
