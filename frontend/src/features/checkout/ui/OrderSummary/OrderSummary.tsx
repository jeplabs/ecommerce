import clsx from 'clsx';
import { formatCurrency } from '@/shared/lib/format';
import type { CartItemUiView } from '@/entities/cart';
import type { ShippingServiceCosts } from '@/entities/shipping';
import styles from './OrderSummary.module.css';

type OrderSummaryProps = {
    items: CartItemUiView[];
    subtotal: number;
    shippingCostInTotal?: number;
    total?: number;
    servicioCostos?: ShippingServiceCosts | null;
    compact?: boolean;
    /** Oculta la lista de ítems (p. ej. paso 1 con revisión en la columna principal). */
    totalsOnly?: boolean;
    /** Si es true, muestra el mensaje de contra entrega en vez de precio de envío. */
    isContraEntrega?: boolean;
};

export default function OrderSummary({
    items,
    subtotal,
    shippingCostInTotal = 0,
    total,
    servicioCostos = null,
    compact = false,
    totalsOnly = false,
    isContraEntrega = false,
}: OrderSummaryProps) {
    const displayTotal = total ?? subtotal + shippingCostInTotal;
    const { enLinea = 0 } = servicioCostos || {};
    const shippingIsFree = shippingCostInTotal === 0 && !isContraEntrega;
    const showStruckListPrice = shippingIsFree && enLinea > 0;

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
                    <dt>Envío</dt>
                    <dd>
                        {isContraEntrega ? (
                            <span className={styles.contraEntregaNote}>
                                Se paga al recibir
                            </span>
                        ) : shippingIsFree ? (
                            <span className={styles.freeWrap}>
                                {showStruckListPrice && (
                                    <span className={styles.struck}>
                                        {formatCurrency(enLinea)}
                                    </span>
                                )}
                                <span className={styles.free}>Gratis</span>
                            </span>
                        ) : (
                            formatCurrency(shippingCostInTotal)
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
