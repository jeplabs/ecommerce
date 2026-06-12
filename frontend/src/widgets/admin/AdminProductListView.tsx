import { useProduct, useToast } from '@/app/providers';
import type { NavigateFunction } from 'react-router-dom';
import type { ProductAdminApi, ProductApi } from '@/entities/product';
import { Button } from '@/shared/ui/Button';
import styles from './AdminProductListView.module.css';

type AdminProductListViewProps = {
    onNavigate: NavigateFunction;
};

type AdminListProduct = (ProductApi | ProductAdminApi) & {
    descripcion?: string | null;
    imagenesUrl?: string[];
    images?: Array<string | { url?: string; imagenUrl?: string }>;
};

function getProductImageSrc(producto: AdminListProduct): string {
    return (
        producto.imagenesUrl?.[0] ||
        (typeof producto.imagenes?.[0]?.url === 'string'
            ? producto.imagenes.find((i) => i?.principal)?.url || producto.imagenes?.[0]?.url
            : '') ||
        (typeof producto.images?.[0] === 'string'
            ? producto.images?.[0]
            : producto.images?.[0]?.url || producto.images?.[0]?.imagenUrl || '') ||
        ''
    );
}

function formatEstado(estado: string | undefined): string {
    switch ((estado || '').toUpperCase()) {
        case 'DISPONIBLE':
            return 'Disponible';
        case 'SIN_STOCK':
            return 'Sin stock';
        case 'OCULTO':
            return 'Oculto';
        case 'DESCONTINUADO':
            return 'Descontinuado';
        default:
            return 'Desconocido';
    }
}

export default function AdminProductListView({ onNavigate }: AdminProductListViewProps) {
    const { showSuccess, showError } = useToast();
    const {
        productos,
        productosOcultos,
        productosDescontinuados,
        loading,
        reloadProducts,
        deleteProduct,
    } = useProduct();

    const handleDelete = async (id: number, nombre: string) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que quieres desactivar el producto ${nombre}?`
        );
        if (!confirmed) return;

        try {
            const result = await deleteProduct(id);

            if (result.success) {
                showSuccess('Producto desactivado exitosamente');
                await reloadProducts();
            } else {
                showError(`Error al desactivar el producto: ${result.message}`);
            }
        } catch (error) {
            console.error('ProductList error en handleDelete:', error);
            showError('Error al desactivar el producto');
        }
    };

    const renderProductCard = (producto: AdminListProduct, showImage = true) => (
        <article key={producto.id} className={styles.productCard}>
            {showImage && (
                <div className={styles.cardPreview}>
                    {getProductImageSrc(producto) ? (
                        <img
                            src={getProductImageSrc(producto)}
                            alt={producto.nombre}
                            className={styles.productImage}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.warn('Error cargando imagen:', producto.nombre, target.src);
                                target.src = '/placeholder-product.png';
                            }}
                        />
                    ) : (
                        <div className={styles.productImagePlaceholder}>
                            <span>Sin imagen</span>
                        </div>
                    )}
                    <div className={styles.productPriceTag}>${producto.precioVenta || 'N/A'}</div>
                </div>
            )}

            <div className={styles.cardBody}>
                <h3 className={styles.cardName}>
                    {showImage && producto.nombre.length > 25
                        ? `${producto.nombre.slice(0, 25)}...`
                        : producto.nombre}
                </h3>
                {!showImage && (
                    <p className={styles.cardDesc}>{producto.descripcion || 'Sin descripción'}</p>
                )}

                <div className={styles.productInfo}>
                    <span className={styles.productSku}>SKU: {producto.sku}</span>
                    {showImage && (
                        <span className={styles.productStock}>Stock: {producto.stock || 0}</span>
                    )}
                    {!showImage && producto.stock != null && (
                        <span className={styles.productStock}>Stock: {producto.stock || 0}</span>
                    )}
                    <span className={styles.productStatus} data-status={producto.estado || 'desconocido'}>
                        {formatEstado(producto.estado)}
                    </span>
                </div>

                <div className={styles.productActions}>
                    <Button
                        type="button"
                        variant="outlinePrimary"
                        onClick={() => onNavigate(`/admin/products/edit/${producto.id}`)}
                        title="Editar producto"
                    >
                        ✏️ Editar
                    </Button>
                    <Button
                        type="button"
                        variant="outlineDanger"
                        onClick={() => handleDelete(producto.id, producto.nombre)}
                        title="Eliminar producto"
                    >
                        🗑️ Eliminar
                    </Button>
                </div>
            </div>
        </article>
    );

    return (
        <main className={styles.root}>
            <h1>Admin: Productos y Categorías</h1>

            {loading && <div className={styles.loading}>Cargando datos...</div>}

            <div className={styles.actions}>
                <Button type="button" variant="primary" onClick={() => onNavigate('/admin/products/new')}>
                    Agregar Producto
                </Button>
                <Button type="button" variant="primary" onClick={() => onNavigate('/admin')}>
                    Volver atrás
                </Button>
            </div>

            <h2>Productos Disponibles</h2>
            <section>
                {productos?.length > 0 ? (
                    <div className={styles.grid}>
                        {(productos as AdminListProduct[]).map((producto) =>
                            renderProductCard(producto, true)
                        )}
                    </div>
                ) : (
                    <p>No hay productos disponibles.</p>
                )}
            </section>

            <h2>Productos Ocultos</h2>
            <section>
                {productosOcultos?.length > 0 ? (
                    <div className={styles.grid}>
                        {(productosOcultos as AdminListProduct[]).map((producto) =>
                            renderProductCard(producto, false)
                        )}
                    </div>
                ) : (
                    <p>No hay productos disponibles.</p>
                )}
            </section>

            <h2>Productos Descontinuados</h2>
            <section>
                {productosDescontinuados?.length > 0 ? (
                    <div className={styles.grid}>
                        {(productosDescontinuados as AdminListProduct[]).map((producto) => (
                            <article key={producto.id} className={styles.productCard}>
                                <div className={styles.cardBody}>
                                    <h3 className={styles.cardName}>{producto.nombre}</h3>
                                    <p className={styles.cardDesc}>
                                        {producto.descripcion || 'Sin descripción'}
                                    </p>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productSku}>SKU: {producto.sku}</span>
                                        <span
                                            className={styles.productStatus}
                                            data-status={producto.estado || 'desconocido'}
                                        >
                                            {formatEstado(producto.estado)}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p>No hay productos descontinuados.</p>
                )}
            </section>
        </main>
    );
}
