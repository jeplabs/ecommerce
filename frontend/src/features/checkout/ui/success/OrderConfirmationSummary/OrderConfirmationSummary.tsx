import OrderShippingSummary from '@/features/order/ui/OrderShippingSummary/OrderShippingSummary';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '@/shared/lib/format';
import type { OrderApi } from '@/entities/order';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import './OrderConfirmationSummary.css';

type OrderConfirmationSummaryProps = {
    orden: OrderApi | null | undefined;
    payment?: PaymentSuccessResult | null;
};

export default function OrderConfirmationSummary({ orden, payment }: OrderConfirmationSummaryProps) {
    if (!orden) return null;

    const costoEnvio = Number(orden.costoEnvio ?? 0);

    return (
        <article className="order-confirmation" aria-labelledby="order-confirmation-title">
            <header className="order-confirmation__head">
                <div>
                    <h2 id="order-confirmation-title">Resumen del pedido</h2>
                    <p className="order-confirmation__date">{formatDateTime(orden.creadoAt)}</p>
                </div>
                <span className="order-confirmation__status">
                    {formatEstadoOrden(orden.estado)}
                </span>
            </header>

            {payment && (
                <section className="order-confirmation__payment" aria-labelledby="order-payment-title">
                    <h3 id="order-payment-title" className="order-confirmation__section-title">
                        Pago
                    </h3>
                    <dl>
                        <div className="order-confirmation__payment-row">
                            <dt>Método</dt>
                            <dd>{payment.provider}</dd>
                        </div>
                        <div className="order-confirmation__payment-row">
                            <dt>Referencia</dt>
                            <dd className="order-confirmation__payment-ref">{payment.transactionId}</dd>
                        </div>
                        {payment.last4 && (
                            <div className="order-confirmation__payment-row">
                                <dt>Tarjeta</dt>
                                <dd>•••• {payment.last4}</dd>
                            </div>
                        )}
                    </dl>
                </section>
            )}

            <OrderShippingSummary orden={orden} />

            <section aria-labelledby="order-items-title">
                <h3 id="order-items-title" className="order-confirmation__section-title">
                    Productos
                </h3>
                <ul className="order-confirmation__items">
                    {(orden.items || []).map((item) => (
                        <li key={item.id} className="order-confirmation__item">
                            <div>
                                <span className="order-confirmation__item-name">
                                    {item.nombreProducto}
                                </span>
                                <span className="order-confirmation__item-sku">SKU: {item.sku}</span>
                            </div>
                            <div className="order-confirmation__item-qty">
                                <span>Cant. {item.cantidad}</span>
                                <span className="order-confirmation__item-price">
                                    {formatCurrency(item.subtotal)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="order-confirmation__totals">
                <div className="order-confirmation__total-row">
                    <span>Subtotal productos</span>
                    <span>{formatCurrency(orden.subtotal)}</span>
                </div>
                {orden.servicioEnvio != null && (
                    <div className="order-confirmation__total-row">
                        <span>Envío ({orden.servicioEnvio})</span>
                        <span>{costoEnvio === 0 ? 'Gratis' : formatCurrency(costoEnvio)}</span>
                    </div>
                )}
                <div className="order-confirmation__total-row">
                    <span>IVA</span>
                    <span>{formatCurrency(orden.iva)}</span>
                </div>
                <div className="order-confirmation__total-row order-confirmation__total-row--grand">
                    <span>Total pagado</span>
                    <span>{formatCurrency(orden.total)}</span>
                </div>
            </div>

            {orden.notas?.trim() && (
                <div className="order-confirmation__notes">
                    <strong className="order-confirmation__section-title">Notas del pedido</strong>
                    <p>{orden.notas}</p>
                </div>
            )}
        </article>
    );
}
