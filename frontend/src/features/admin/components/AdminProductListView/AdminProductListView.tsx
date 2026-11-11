import type { NavigateFunction } from 'react-router-dom';
import { useCategorias, useProduct, useToast } from '@/app/providers';
import type { ProductAdminApi } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui';
import { ProductImage } from '@/components/ui/ProductImage';
import { useScrollToTopOnPageChange } from '@/hooks/useScrollToTopOnPageChange';
import { formatCurrency } from '@/utils/format';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import AdminProductFilters from '../AdminProductFilters';
import styles from './AdminProductListView.module.css';

type AdminProductListViewProps = {
    onNavigate: NavigateFunction;
};

function getProductImageSrc(producto: ProductAdminApi): string {
    if (!producto.imagenes || producto.imagenes.length === 0) return '';
    return (
        producto.imagenes.find((img) => img.principal)?.url ||
        producto.imagenes[0]?.url ||
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
    const { arbolCategorias } = useCategorias();
    const { reloadProducts } = useProduct();
    const {
        productos,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        totalElements,
        searchQuery,
        setSearchQuery,
        categoriaId,
        setCategoriaId,
        estadoFiltro,
        setEstadoFiltro,
        setPage,
        setPageSize,
        hasActiveFilters,
        clearFilters,
        refetch,
        deleteProduct,
    } = useAdminProducts();

    useScrollToTopOnPageChange(page);

    const handleDelete = async (id: number, nombre: string) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que quieres desactivar el producto ${nombre}?`
        );
        if (!confirmed) return;

        try {
            const result = await deleteProduct(id);

            if (result.success) {
                showSuccess('Producto desactivado exitosamente');
                void reloadProducts(true);
            } else {
                showError(`Error al desactivar el producto: ${result.message}`);
            }
        } catch (err) {
            console.error('ProductList error en handleDelete:', err);
            showError('Error al desactivar el producto');
        }
    };

    const renderProductCard = (producto: ProductAdminApi) => (
        <article key={producto.id} className={styles.productCard}>
            <div className={styles.cardPreview}>
                <ProductImage
                    src={getProductImageSrc(producto)}
                    alt={producto.nombre}
                    className={styles.productImage}
                />
                <div className={styles.productPriceTag}>
                    {producto.precioVenta != null ? formatCurrency(producto.precioVenta) : 'N/A'}
                </div>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.cardName} title={producto.nombre}>
                    {producto.nombre.length > 42
                        ? `${producto.nombre.slice(0, 42)}...`
                        : producto.nombre}
                </h3>

                <div className={styles.productInfo}>
                    <span className={styles.productSku}>SKU: {producto.sku}</span>
                    <span className={styles.productStock}>Stock: {producto.stock ?? 0}</span>
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
                    {producto.estado !== 'DESCONTINUADO' && (
                        <Button
                            type="button"
                            variant="outlineDanger"
                            onClick={() => handleDelete(producto.id, producto.nombre)}
                            title="Eliminar producto"
                        >
                            🗑️ Eliminar
                        </Button>
                    )}
                </div>
            </div>
        </article>
    );

    return (
        <main className={styles.root}>
            <div className={styles.pageHeader}>
                <div className={styles.titleBlock}>
                    <h1>Productos</h1>
                    <p className={styles.lead}>
                        {totalElements} producto{totalElements === 1 ? '' : 's'} registrado
                        {totalElements === 1 ? '' : 's'}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => onNavigate('/admin/products/new')}
                >
                    Agregar Producto
                </Button>
            </div>

            <AdminProductFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoriaId={categoriaId}
                onCategoryChange={setCategoriaId}
                estadoFiltro={estadoFiltro}
                onStatusChange={setEstadoFiltro}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                categorias={arbolCategorias}
                totalElements={totalElements}
                currentCount={productos.length}
                page={page}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
            />

            {error && (
                <div className={styles.errorBox} role="alert">
                    <span>{error}</span>
                    <Button type="button" variant="outlinePrimary" onClick={() => void refetch()}>
                        Reintentar
                    </Button>
                </div>
            )}

            {loading && productos.length === 0 ? (
                <div className={styles.loading}>Cargando productos...</div>
            ) : productos.length > 0 ? (
                <section aria-label="Listado de productos">
                    <div className={styles.grid}>
                        {productos.map((producto) => renderProductCard(producto))}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </section>
            ) : (
                <div className={styles.emptyState}>
                    <p>
                        {hasActiveFilters
                            ? 'No se encontraron productos con los filtros seleccionados.'
                            : 'No hay productos registrados.'}
                    </p>
                    {hasActiveFilters && (
                        <Button type="button" variant="outlinePrimary" onClick={clearFilters}>
                            Limpiar filtros
                        </Button>
                    )}
                </div>
            )}
        </main>
    );
}
