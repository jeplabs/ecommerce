import clsx from 'clsx';
import type { ProductAdminApi } from '@/features/catalog';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatCurrency } from '@/utils/format';
import styles from './AdminProductsTable.module.css';

type AdminProductsTableProps = {
    productos: ProductAdminApi[];
    onEdit: (id: number) => void;
    onDelete: (id: number, nombre: string) => void;
};

const ESTADO_CLASS: Record<string, string> = {
    DISPONIBLE: styles.pillAvailable,
    SIN_STOCK: styles.pillNoStock,
    OCULTO: styles.pillHidden,
    DESCONTINUADO: styles.pillDiscontinued,
};

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
            return estado || 'Desconocido';
    }
}

function getProductImageSrc(producto: ProductAdminApi): string {
    if (!producto.imagenes || producto.imagenes.length === 0) return '';
    return (
        producto.imagenes.find((img) => img.principal)?.url ||
        producto.imagenes[0]?.url ||
        ''
    );
}

/**
 * Tabla de productos para visualización en desktop en el panel de administración.
 * Ofrece la misma información y acciones que las tarjetas pero con layout tabular estructurado.
 */
export default function AdminProductsTable({
    productos,
    onEdit,
    onDelete,
}: AdminProductsTableProps) {
    return (
        <div
            tabIndex={0}
            role="region"
            aria-label="Tabla de productos"
            className={styles.root}
        >
            <div className={styles.scroll}>
                <table className={styles.grid}>
                    <thead>
                        <tr>
                            <th scope="col">Producto</th>
                            <th scope="col">SKU</th>
                            <th scope="col">Precio</th>
                            <th scope="col" className={styles.colNarrow}>Stock</th>
                            <th scope="col">Estado</th>
                            <th scope="col" className={styles.colAction}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.map((producto) => {
                            const imageSrc = getProductImageSrc(producto);
                            const estadoKey = (producto.estado || '').toUpperCase();
                            const pillClass = ESTADO_CLASS[estadoKey] || styles.pillHidden;
                            const categoriasLabel = producto.categorias && producto.categorias.length > 0
                                ? producto.categorias.map((c) => c.nombre).join(', ')
                                : null;

                            return (
                                <tr key={producto.id} className={styles.row}>
                                    <td className={styles.cellProduct}>
                                        <div className={styles.productCellWrap}>
                                            <ProductImage
                                                src={imageSrc}
                                                alt={producto.nombre}
                                                className={styles.productThumbnail}
                                            />
                                            <div className={styles.productDetails}>
                                                <span
                                                    className={styles.productName}
                                                    title={producto.nombre}
                                                >
                                                    {producto.nombre}
                                                </span>
                                                {categoriasLabel && (
                                                    <span
                                                        className={styles.productCategory}
                                                        title={categoriasLabel}
                                                    >
                                                        {categoriasLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.cellSku}>
                                        {producto.sku}
                                    </td>
                                    <td className={styles.cellPrice}>
                                        {producto.precioVenta != null
                                            ? formatCurrency(producto.precioVenta)
                                            : 'N/A'}
                                    </td>
                                    <td className={clsx(styles.cellStock, (producto.stock ?? 0) <= 0 && styles.stockZero)}>
                                        {producto.stock ?? 0}
                                    </td>
                                    <td>
                                        <span className={clsx(styles.pill, pillClass)}>
                                            {formatEstado(producto.estado)}
                                        </span>
                                    </td>
                                    <td className={styles.cellActions}>
                                        <div className={styles.actionsWrap}>
                                            <button
                                                type="button"
                                                className={styles.btnEdit}
                                                onClick={() => onEdit(producto.id)}
                                                title={`Editar ${producto.nombre}`}
                                                aria-label={`Editar ${producto.nombre}`}
                                            >
                                                ✏️ Editar
                                            </button>
                                            {producto.estado !== 'DESCONTINUADO' && (
                                                <button
                                                    type="button"
                                                    className={styles.btnDelete}
                                                    onClick={() => onDelete(producto.id, producto.nombre)}
                                                    title={`Eliminar ${producto.nombre}`}
                                                    aria-label={`Eliminar ${producto.nombre}`}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
