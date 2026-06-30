import clsx from 'clsx';
import OrderShippingSummary from '@/features/order/ui/OrderShippingSummary/OrderShippingSummary';
//import { isBankTransferOrder } from '@/features/checkout/lib/transfer-order-storage';
import OrderBankTransferSection from '@/features/checkout/ui/OrderBankTransferSection/OrderBankTransferSection';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '@/shared/lib/format';
import type { OrderApi, OrderStatus } from '@/entities/order';
import { Button } from '@/shared/ui/Button';
import styles from './OrderDetail.module.css';

const ESTADO_CLASS: Partial<Record<OrderStatus, string>> = {
    PENDIENTE: styles.statusPending,
    CONFIRMADA: styles.statusConfirmed,
    EN_PROCESO: styles.statusProcessing,
    ENVIADA: styles.statusShipped,
    ENTREGADA: styles.statusDelivered,
    CANCELADA: styles.statusCancelled,
};

type OrderDetailProps = {
    orden: OrderApi;
    onClose: () => void;
    onCancel?: (ordenId: number) => void;
    cancelling?: boolean;
    titleId?: string;
    className?: string;
};

export default function OrderDetail({ orden, onClose, onCancel, cancelling, titleId, className }: OrderDetailProps) {
    if (!orden) return null;

    const canCancel = orden.estado === 'PENDIENTE' || orden.estado === 'CONFIRMADA';
    const costoEnvio = Number(orden.costoEnvio ?? 0);
    const showBankTransfer =
        orden.metodoPago === 'TRANSFERENCIA' ||
        orden.metodoPago === 'TRANSFERENCIA_BANCARIA';

    return (
        <div className={clsx(styles.root, className)}>
            <div className={styles.header}>
                <div>
                    <h3 id={titleId}>Pedido #{orden.id}</h3>
                    <p className={styles.date}>{formatDateTime(orden.creadoAt)}</p>
                </div>
                <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar detalle">
                    ✕
                </button>
            </div>

            <span className={clsx(styles.status, ESTADO_CLASS[orden.estado])}>
                {formatEstadoOrden(orden.estado)}
            </span>

            <OrderShippingSummary orden={orden} />

            {showBankTransfer && <OrderBankTransferSection orden={orden} />}

            <div className={styles.section}>
                <h4>Productos</h4>
                <ul className={styles.items}>
                    {orden.items?.map((item) => (
                        <li key={item.id} className={styles.item}>
                            <div>
                                <span className={styles.itemName}>{item.nombreProducto}</span>
                                <span className={styles.itemSku}>SKU: {item.sku}</span>
                            </div>
                            <div className={styles.itemQty}>
                                <span>×{item.cantidad}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.totals}>
                <h4 className={styles.totalsHeading}>Resumen</h4>
                <div className={styles.totalRow}>
                    <span>Subtotal productos</span>
                    <span>{formatCurrency(orden.subtotal)}</span>
                </div>
                {orden.servicioEnvio != null && (
                    <div className={styles.totalRow}>
                        <span>Envío ({orden.servicioEnvio})</span>
                        <span>
                            {costoEnvio === 0 ? 'Gratis' : formatCurrency(costoEnvio)}
                        </span>
                    </div>
                )}
                <div className={styles.totalRow}>
                    <span>IVA</span>
                    <span>{formatCurrency(orden.iva)}</span>
                </div>
                <div className={clsx(styles.totalRow, styles.totalRowGrand)}>
                    <span>Total</span>
                    <span>{formatCurrency(orden.total)}</span>
                </div>
            </div>

            {orden.notas && (
                <div className={styles.section}>
                    <h4>Notas</h4>
                    <p>{orden.notas}</p>
                </div>
            )}

            {canCancel && onCancel && (
                <Button
                    type="button"
                    variant="ghost"
                    className={styles.cancel}
                    fullWidth
                    onClick={() => onCancel(orden.id)}
                    disabled={cancelling}
                >
                    {cancelling ? 'Cancelando…' : 'Cancelar pedido'}
                </Button>
            )}
        </div>
    );
}
