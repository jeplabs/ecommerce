import clsx from 'clsx';
import { formatCurrency } from '@/shared/lib/format';
import type { CartItemUiView } from '@/entities/cart';
import type { ShippingServiceCosts } from '@/entities/shipping';
import styles from './OrderSummary.module.css';

type OrderSummaryProps = {
    items: CartItemUiView[];
    subtotal: number;
    shippingCostDisplay?: number;
    shippingCostInTotal?: number;
    total?: number;
    envioGratis?: boolean;
    servicioCostos?: ShippingServiceCosts | null;
    compact?: boolean;
    /** Oculta la lista de ítems (p. ej. paso 1 con revisión en la columna principal). */
    totalsOnly?: boolean;
};

export default function OrderSummary({
    items,
    subtotal,
    shippingCostInTotal = 0,
    total,
    envioGratis = false,
    servicioCostos = null,
    compact = false,
    totalsOnly = false,
}: OrderSummaryProps) {
    const displayTotal = total ?? subtotal + shippingCostInTotal;
    const { tarifa = 0 } = servicioCostos || {};
    const shippingIsFree = shippingCostInTotal === 0;
    const showShippingStruck = envioGratis && !shippingIsFree && tarifa > 0;

    return (
        <aside className={clsx(styles.root, compact && styles.compact)}>
            <h3 className={styles.title}>Resumen del pedido</h3>

            {!totalsOnly && (
                <ul className={styles.items}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt="" className={styles.thumb} />
                            ) : (
                                <div className={styles.thumbPlaceholder} />
                            )}
                            <div className={styles.itemInfo}>
                                <span className={styles.name}>{item.name || 'Producto'}</span>
                                <span className={styles.qty}>
                                    ×{item.quantity}
                                    {item.sku ? ` · ${item.sku}` : ''}
                                </span>
                            </div>
                            <span className={styles.price}>
                                {formatCurrency(item.price * item.quantity)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <dl className={styles.breakdown}>
                <div className={styles.row}>
                    <dt>Subtotal productos</dt>
                    <dd>{formatCurrency(subtotal)}</dd>
                </div>

                <div className={clsx(styles.row, styles.rowEnvio)}>
                    <dt>Envío (pago en línea)</dt>
                    <dd>
                        {shippingIsFree ? (
                            <span className={styles.freeWrap}>
                                {envioGratis && tarifa > 0 && (
                                    <span className={styles.struck}>
                                        {formatCurrency(tarifa)}
                                    </span>
                                )}
                                <span className={styles.free}>Gratis</span>
                            </span>
                        ) : (
                            <span className={styles.freeWrap}>
                                {showShippingStruck && (
                                    <span className={styles.struck}>
                                        {formatCurrency(tarifa)}
                                    </span>
                                )}
                                {formatCurrency(shippingCostInTotal)}
                            </span>
                        )}
                    </dd>
                </div>
            </dl>

            <div className={styles.total}>
                <span>Total a pagar</span>
                <strong>{formatCurrency(displayTotal)}</strong>
            </div>

            <p className={styles.note}>Precios con IVA incluido</p>
        </aside>
    );
}
