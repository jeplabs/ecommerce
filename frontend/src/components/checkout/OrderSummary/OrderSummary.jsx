import { formatCurrency } from '../../../utils/formatters';
import { FORMA_PAGO_ENVIO } from '../../../utils/envioHelpers';
import { formatFormaPagoEnvio } from '../../../utils/ordenDisplayHelpers';
import './OrderSummary.css';

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
}) {
    const displayTotal = total ?? subtotal + shippingCostInTotal;
    const envioContraEntrega = formaPagoEnvio === FORMA_PAGO_ENVIO.CONTRA_ENTREGA;
    const { tarifa = 0, recargo = 0 } = servicioCostos || {};
    const showShippingBreakdown =
        !envioGratis && servicioCostos && (tarifa > 0 || recargo > 0 || shippingCostDisplay > 0);

    return (
        <aside className={`order-summary ${compact ? 'order-summary--compact' : ''}`}>
            <h3 className="order-summary__title">Resumen del pedido</h3>

            <ul className="order-summary__items">
                {items.map((item) => (
                    <li key={item.id} className="order-summary__item">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="order-summary__thumb" />
                        ) : (
                            <div className="order-summary__thumb-placeholder" />
                        )}
                        <div className="order-summary__meta">
                            <span className="order-summary__name">{item.name}</span>
                            <span className="order-summary__qty">×{item.quantity}</span>
                        </div>
                        <span className="order-summary__price">
                            {formatCurrency(item.price * item.quantity)}
                        </span>
                    </li>
                ))}
            </ul>

            <dl className="order-summary__breakdown">
                <div className="order-summary__row">
                    <dt>Subtotal productos</dt>
                    <dd>{formatCurrency(subtotal)}</dd>
                </div>

                <div className="order-summary__row order-summary__row--envio">
                    <dt>
                        Envío
                        <span className="order-summary__envio-mode">
                            {formatFormaPagoEnvio(formaPagoEnvio)}
                        </span>
                    </dt>
                    <dd>
                        {envioGratis ? (
                            <span className="order-summary__free-wrap">
                                {showShippingBreakdown && (
                                    <span className="order-summary__struck">
                                        {formatCurrency(
                                            envioContraEntrega
                                                ? tarifa + recargo
                                                : tarifa
                                        )}
                                    </span>
                                )}
                                <span className="order-summary__free">Gratis</span>
                            </span>
                        ) : envioContraEntrega ? (
                            <span className="order-summary__envio-contra">
                                {formatCurrency(shippingCostDisplay)}
                                <span className="order-summary__envio-note">
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
                        <div className="order-summary__row order-summary__row--sub">
                            <dt>Tarifa de envío</dt>
                            <dd>{formatCurrency(tarifa)}</dd>
                        </div>
                        {recargo > 0 && (
                            <div className="order-summary__row order-summary__row--sub">
                                <dt>Recargo contra entrega</dt>
                                <dd>{formatCurrency(recargo)}</dd>
                            </div>
                        )}
                    </>
                )}
            </dl>

            <div className="order-summary__total">
                <span>Total a pagar ahora</span>
                <strong>{formatCurrency(displayTotal)}</strong>
            </div>

            {envioContraEntrega && !envioGratis && shippingCostDisplay > 0 && (
                <p className="order-summary__contra-note">
                    + {formatCurrency(shippingCostDisplay)} de envío al recibir el pedido
                </p>
            )}

            <p className="order-summary__note">Precios con IVA incluido</p>
        </aside>
    );
}
