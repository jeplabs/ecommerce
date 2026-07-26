import { useProduct, useCategorias, useCart } from '@/app/providers';
import { useState, useEffect, useCallback } from 'react';
import { productApi } from '@/entities/product/api';
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

async function fetchProductBySlug(slug: string): Promise<ProductApi> {
    try {
        return await productApi.getBySlug(slug);
    } catch {
        const numericId = Number.parseInt(slug, 10);
        if (Number.isFinite(numericId) && String(numericId) === slug) {
            return productApi.getById(numericId);
        }
        throw new Error('Producto no encontrado');
    }
}

export default function ProductDetailView({ slug, onBackHome }: ProductDetailViewProps) {
    const { upsertProduct } = useProduct();
    const { arbolCategorias } = useCategorias();
    const { addToCart } = useCart();

    const [producto, setProducto] = useState<ProductApi | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProduct = useCallback(
        async (options?: { silent?: boolean }) => {
            if (!slug) {
                setProducto(null);
                setLoading(false);
                return;
            }

            if (!options?.silent) {
                setLoading(true);
            }

            try {
                const data = await fetchProductBySlug(slug);
                setProducto(data);
                upsertProduct(data);
            } catch {
                setProducto(null);
            } finally {
                setLoading(false);
            }
        },
        [slug, upsertProduct]
    );

    useEffect(() => {
        void loadProduct();
    }, [loadProduct]);

    useEffect(() => {
        const refreshOnVisible = () => {
            if (document.visibilityState === 'visible') {
                void loadProduct({ silent: true });
            }
        };

        document.addEventListener('visibilitychange', refreshOnVisible);
        return () => document.removeEventListener('visibilitychange', refreshOnVisible);
    }, [loadProduct]);

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
