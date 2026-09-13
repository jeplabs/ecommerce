import { useCart, useToast } from '@/app/providers';
import { Button } from '@/shared/ui/Button';
import buttonStyles from '@/shared/ui/Button/Button.module.css';
import { ProductImage } from '@/shared/ui/ProductImage';
import clsx from 'clsx';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './CartView.module.css';

type CartViewProps = {
    onProceedToCheckout: () => void;
};

export default function CartView({ onProceedToCheckout }: CartViewProps) {
    const { items, cartTotal, loading, updateQuantity, removeFromCart, clearCart, isEmpty } =
        useCart();
    const { showSuccess, showError } = useToast();

    const handleQuantityChange = async (itemId: number, quantity: number) => {
        const result = await updateQuantity(itemId, quantity);
        if (result.success) {
            showSuccess('Cantidad actualizada');
        } else {
            showError(result.error || 'Error al actualizar cantidad');
        }
    };

    const handleRemove = async (itemId: number) => {
        const result = await removeFromCart(itemId);
        if (result.success) {
            showError('Producto eliminado del carrito');
        } else {
            showError(result.error || 'Error al eliminar producto');
        }
    };

    const handleClear = async () => {
        const result = await clearCart();
        if (result.success) {
            showSuccess('Carrito limpiado');
        } else {
            showError(result.error || 'Error al limpiar el carrito');
        }
    };

    const totalDisplay = useMemo(() => {
        return cartTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 });
    }, [cartTotal]);

    return (
        <section className={styles.content}>
            <h1>Mi Carrito</h1>

            {isEmpty ? (
                <div className={styles.empty}>
                    <p>Tu carrito está vacío.</p>
                    <Link
                        to="/catalogo"
                        className={clsx(
                            buttonStyles.button,
                            buttonStyles.primary,
                            styles.emptyLink
                        )}
                    >
                        Ver productos
                    </Link>
                </div>
            ) : (
                <>
                    <div className={styles.table} role="table" aria-label="Productos en el carrito">
                        <div className={styles.tableHeader} role="row">
                            <span role="columnheader">Producto</span>
                            <span role="columnheader">Cantidad</span>
                            <span role="columnheader">Subtotal</span>
                            <span role="columnheader">Acción</span>
                        </div>
                        {items.map((item) => {
                            const subtotalFormatted = (item.price * item.quantity).toLocaleString(
                                'es-ES',
                                { minimumFractionDigits: 2 }
                            );
                            return (
                                <article key={item.id} className={styles.tableRow} role="row">
                                    <div className={styles.itemInfo} role="cell">
                                        <Link to={`/producto/${item.slug}`} className={styles.itemLink}>
                                            <ProductImage
                                                src={item.imageUrl}
                                                alt={item.altText || item.name}
                                                className={styles.itemThumb}
                                            />
                                        </Link>
                                        <div className={styles.itemMeta}>
                                            <Link to={`/producto/${item.slug}`} className={styles.itemLink}>
                                                <p className={styles.itemName}>{item.name}</p>
                                            </Link>
                                            
                                            <p className={styles.itemPrice}>
                                                $
                                                {item.price.toLocaleString('es-ES', {
                                                    minimumFractionDigits: 2,
                                                })}{' '}
                                                <span className={styles.itemPriceUnit}>c/u</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={styles.itemQty}
                                        role="cell"
                                        data-label="Cantidad"
                                    >
                                        <button
                                            type="button"
                                            className={styles.qtyBtn}
                                            aria-label="Disminuir cantidad"
                                            onClick={() =>
                                                handleQuantityChange(item.id, item.quantity - 1)
                                            }
                                            disabled={loading || item.quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <span className={styles.itemQtyValue} aria-live="polite">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.qtyBtn}
                                            aria-label="Aumentar cantidad"
                                            onClick={() =>
                                                handleQuantityChange(item.id, item.quantity + 1)
                                            }
                                            disabled={loading}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div
                                        className={styles.itemSubtotal}
                                        role="cell"
                                        data-label="Subtotal"
                                    >
                                        ${subtotalFormatted}
                                    </div>
                                    <div
                                        className={styles.itemActions}
                                        role="cell"
                                        data-label="Acción"
                                    >
                                        <Button
                                            type="button"
                                            variant="outlineDanger"
                                            className={styles.removeItem}
                                            onClick={() => handleRemove(item.id)}
                                            disabled={loading}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className={styles.summary}>
                        <div className={styles.summaryTotal}>
                            <span>Total</span>
                            <strong>${totalDisplay}</strong>
                        </div>
                        <div className={styles.summaryActions}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleClear}
                                disabled={loading}
                            >
                                Vaciar carrito
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                disabled={loading}
                                onClick={onProceedToCheckout}
                            >
                                Proceder al pago
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
