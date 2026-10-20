import { useState } from 'react';
import clsx from 'clsx';
import OrderShippingSummary from '@/features/order/ui/OrderShippingSummary/OrderShippingSummary';
import shippingSummaryStyles from '@/features/order/ui/OrderShippingSummary/OrderShippingSummary.module.css';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '@/shared/lib/format';
import type { OrderApi, OrderStatus } from '@/entities/order';
import type { PaymentSuccessResult } from '@/features/checkout/model/schemas/payment';
import BankTransferModal from '@/features/checkout/ui/BankTransferModal/BankTransferModal';
import CheckoutSuccessHeader from '@/features/checkout/ui/success/CheckoutSuccessHeader/CheckoutSuccessHeader';
import styles from './OrderConfirmationSummary.module.css';

const ESTADO_CLASS: Partial<Record<OrderStatus, string>> = {
    PENDIENTE: styles.statusPending,
    CONFIRMADA: styles.statusConfirmed,
    EN_PROCESO: styles.statusProcessing,
    ENVIADA: styles.statusShipped,
    ENTREGADA: styles.statusDelivered,
    CANCELADA: styles.statusCancelled,
};

type OrderConfirmationSummaryProps = {
    orden: OrderApi | null | undefined;
    payment?: PaymentSuccessResult | null;
    isBankTransfer?: boolean;
};

export default function OrderConfirmationSummary({
    orden,
    payment,
    isBankTransfer = false,
}: OrderConfirmationSummaryProps) {
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    if (!orden) return null;

    const costoEnvio = Number(orden.costoEnvio ?? 0);
    const showBankTransfer =
        isBankTransfer ||
        orden.metodoPago === 'TRANSFERENCIA' ||
        orden.metodoPago === 'TRANSFERENCIA_BANCARIA';

    return (
        <article className={styles.root} aria-labelledby="order-confirmation-title">
            <div className={styles.columns}>
                <div className={styles.mainCol}>
                    <CheckoutSuccessHeader isBankTransfer={showBankTransfer} />

                    <header className={styles.head}>
                        <div>
                            <h2 id="order-confirmation-title">
                                <span>Resumen del pedido</span>{' '}
                                <span className={styles.orderNumber}>#{orden.id}</span>
                            </h2>
                            <p className={styles.date}>{formatDateTime(orden.creadoAt)}</p>
                        </div>
                        <span className={clsx(styles.status, ESTADO_CLASS[orden.estado])}>
                            {formatEstadoOrden(orden.estado)}
                        </span>
                    </header>

                    {payment && (
                        <section className={styles.payment} aria-labelledby="order-payment-title">
                            <h3 id="order-payment-title" className={styles.sectionTitle}>
                                Pago
                            </h3>
                            <dl>
                                <div className={styles.paymentRow}>
                                    <dt>Método</dt>
                                    <dd>{payment.provider}</dd>
                                </div>
                                <div className={styles.paymentRow}>
                                    <dt>Referencia</dt>
                                    <dd className={styles.paymentRef}>{payment.transactionId}</dd>
                                </div>
                                {payment.last4 && (
                                    <div className={styles.paymentRow}>
                                        <dt>Tarjeta</dt>
                                        <dd>•••• {payment.last4}</dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    )}

                    <section aria-labelledby="order-items-title">
                        <h3 id="order-items-title" className={styles.sectionTitle}>
                            Productos
                        </h3>
                        <ul className={styles.items}>
                            {(orden.items || []).map((item) => (
                                <li key={item.id} className={styles.item}>
                                    <div className={styles.itemMain}>
                                        <span className={styles.itemName}>
                                            {item.nombreProducto}
                                        </span>
                                        <span className={styles.itemSku}>SKU: {item.sku}</span>
                                    </div>
                                    <div className={styles.itemQty}>
                                        <span>Cant. {item.cantidad}</span>
                                        <span className={styles.itemPrice}>
                                            {formatCurrency(item.subtotal)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span>Subtotal productos</span>
                            <span>{formatCurrency(orden.subtotal)}</span>
                        </div>
                        {orden.servicioEnvio != null && (
                            <div className={styles.totalRow}>
                                <span>Envío ({orden.servicioEnvio})</span>
                                <span>
                                    {orden.formaPagoEnvio === 'CONTRA_ENTREGA'
                                        ? 'Contra entrega'
                                        : costoEnvio === 0
                                          ? 'Gratis'
                                          : formatCurrency(costoEnvio)}
                                </span>
                            </div>
                        )}
                        <div className={styles.totalRow}>
                            <span>IVA</span>
                            <span>{formatCurrency(orden.iva)}</span>
                        </div>
                        <div className={clsx(styles.totalRow, styles.totalRowGrand)}>
                            <span>{showBankTransfer ? 'Total a transferir' : 'Total pagado'}</span>
                            <span>{formatCurrency(orden.total)}</span>
                        </div>
                    </div>

                    {showBankTransfer && (
                        <>
                            <section className={styles.transfer} aria-labelledby="order-transfer-title">
                                <div className={styles.transferContent}>
                                    <h3 id="order-transfer-title" className={styles.transferTitle}>
                                        Datos para transferir
                                    </h3>
                                    <p className={styles.transferNote}>
                                        Tu pedido quedó <strong>pendiente</strong>. Transfiere el monto y sube el
                                        comprobante desde <strong>Mi perfil → Pedidos</strong>.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className={styles.viewTransferBtn}
                                    onClick={() => setIsTransferModalOpen(true)}
                                >
                                    Ver datos
                                </button>
                            </section>

                            <BankTransferModal
                                isOpen={isTransferModalOpen}
                                onClose={() => setIsTransferModalOpen(false)}
                                orderId={orden.id}
                                total={orden.total}
                            />
                        </>
                    )}

                    {orden.notas?.trim() && (
                        <div className={styles.notes}>
                            <strong className={styles.sectionTitle}>Notas del pedido</strong>
                            <p>{orden.notas}</p>
                        </div>
                    )}
                </div>

                <div className={styles.shippingCol}>
                    <OrderShippingSummary orden={orden} className={shippingSummaryStyles.embedded} />
                </div>
            </div>
        </article>
    );
}
