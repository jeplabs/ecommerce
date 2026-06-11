import clsx from 'clsx';
import { formatCurrency } from '@/shared/lib/format';
import { FORMA_PAGO_ENVIO } from '@/entities/order';
import { formatFormaPagoEnvio } from '@/entities/order';
import type { FormaPago } from '@/entities/order';
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
    formaPagoEnvio?: FormaPago;
    servicioCostos?: ShippingServiceCosts | null;
    compact?: boolean;
};

export default function OrderSummary({
    items,
    subtotal,
    shippingCostDisplay = 0,
    shippingCostInTotal = 0,
    total,
    envioGratis = false,
    formaPagoEnvio = FORMA_PAGO_ENVIO.EN_LINEA,
    servicioCostos = null,
    compact = false,
}: OrderSummaryProps) {
    const displayTotal = total ?? subtotal + shippingCostInTotal;
    const envioContraEntrega = formaPagoEnvio === FORMA_PAGO_ENVIO.CONTRA_ENTREGA;
    const { tarifa = 0, recargo = 0 } = servicioCostos || {};
    const showShippingBreakdown =
        !envioGratis && servicioCostos && (tarifa > 0 || recargo > 0 || shippingCostDisplay > 0);

    return (
        <aside className={clsx(styles.root, compact && styles.compact)}>
            <h3 className={styles.title}>Resumen del pedido</h3>

            <ul className={styles.items}>
                {items.map((item) => (
                    <li key={item.id} className={styles.item}>
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className={styles.thumb} />
                        ) : (
                            <div className={styles.thumbPlaceholder} />
                        )}
                        <div>
                            <span className={styles.name}>{item.name}</span>
                            <span className={styles.qty}>×{item.quantity}</span>
                        </div>
                        <span className={styles.price}>
                            {formatCurrency(item.price * item.quantity)}
                        </span>
                    </li>
                ))}
            </ul>

            <dl className={styles.breakdown}>
                <div className={styles.row}>
                    <dt>Subtotal productos</dt>
                    <dd>{formatCurrency(subtotal)}</dd>
                </div>

                <div className={clsx(styles.row, styles.rowEnvio)}>
                    <dt>
                        Envío
                        <span className={styles.envioMode}>
                            {formatFormaPagoEnvio(formaPagoEnvio)}
                        </span>
                    </dt>
                    <dd>
                        {envioGratis ? (
                            <span className={styles.freeWrap}>
                                {showShippingBreakdown && (
                                    <span className={styles.struck}>
                                        {formatCurrency(
                                            envioContraEntrega
                                                ? tarifa + recargo
                                                : tarifa
                                        )}
                                    </span>
                                )}
                                <span className={styles.free}>Gratis</span>
                            </span>
                        ) : envioContraEntrega ? (
                            <span className={styles.envioContra}>
                                {formatCurrency(shippingCostDisplay)}
                                <span className={styles.envioNote}>
                                    Al recibir · no incluido en total
                                </span>
                            </span>
                        ) : (
                            formatCurrency(shippingCostInTotal)
                        )}
                    </dd>
                </div>

                {showShippingBreakdown && envioContraEntrega && !envioGratis && (
                    <>
                        <div className={clsx(styles.row, styles.rowSub)}>
                            <dt>Tarifa de envío</dt>
                            <dd>{formatCurrency(tarifa)}</dd>
                        </div>
                        {recargo > 0 && (
                            <div className={clsx(styles.row, styles.rowSub)}>
                                <dt>Recargo contra entrega</dt>
                                <dd>{formatCurrency(recargo)}</dd>
                            </div>
                        )}
                    </>
                )}
            </dl>

            <div className={styles.total}>
                <span>Total a pagar ahora</span>
                <strong>{formatCurrency(displayTotal)}</strong>
            </div>

            {envioContraEntrega && !envioGratis && shippingCostDisplay > 0 && (
                <p className={styles.contraNote}>
                    + {formatCurrency(shippingCostDisplay)} de envío al recibir el pedido
                </p>
            )}

            <p className={styles.note}>Precios con IVA incluido</p>
        </aside>
    );
}
