import { formatCurrency, formatDateTime, formatEstadoOrden } from '../../../utils/formatters';
import './OrderDetail.css';

const ESTADO_CLASS = {
    PENDIENTE: 'status--pending',
    CONFIRMADA: 'status--confirmed',
    EN_PROCESO: 'status--processing',
    ENVIADA: 'status--shipped',
    ENTREGADA: 'status--delivered',
    CANCELADA: 'status--cancelled',
};

export default function OrderDetail({ orden, onClose, onCancel, cancelling, titleId }) {
    if (!orden) return null;

    const envio = orden.direccionEnvio;
    const canCancel = orden.estado === 'PENDIENTE' || orden.estado === 'CONFIRMADA';

    return (
        <div className="order-detail">
            <div className="order-detail__header">
                <div>
                    <h3 id={titleId}>Pedido #{orden.id}</h3>
                    <p className="order-detail__date">{formatDateTime(orden.creadoAt)}</p>
                </div>
                <button type="button" className="order-detail__close" onClick={onClose} aria-label="Cerrar detalle">
                    ✕
                </button>
            </div>

            <span className={`order-detail__status ${ESTADO_CLASS[orden.estado] || ''}`}>
                {formatEstadoOrden(orden.estado)}
            </span>

            {envio && (
                <div className="order-detail__section">
                    <h4>Dirección de envío</h4>
                    <p><strong>{envio.alias}</strong></p>
                    <p>{envio.calle}</p>
                    <p>{envio.ciudad}, {envio.estado} {envio.codigoPostal}</p>
                    <p>{envio.pais}</p>
                    {envio.telefono && <p>Tel: {envio.telefono}</p>}
                    {envio.referencias && <p className="order-detail__refs">{envio.referencias}</p>}
                </div>
            )}

            <div className="order-detail__section">
                <h4>Productos</h4>
                <ul className="order-detail__items">
                    {orden.items?.map((item) => (
                        <li key={item.id} className="order-detail__item">
                            <div className="order-detail__item-info">
                                <span className="order-detail__item-name">{item.nombreProducto}</span>
                                <span className="order-detail__item-sku">SKU: {item.sku}</span>
                            </div>
                            <div className="order-detail__item-qty">
                                <span>×{item.cantidad}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="order-detail__totals">
                <div className="order-detail__total-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orden.subtotal)}</span>
                </div>
                <div className="order-detail__total-row">
                    <span>IVA</span>
                    <span>{formatCurrency(orden.iva)}</span>
                </div>
                <div className="order-detail__total-row order-detail__total-row--grand">
                    <span>Total</span>
                    <span>{formatCurrency(orden.total)}</span>
                </div>
            </div>

            {orden.notas && (
                <div className="order-detail__section">
                    <h4>Notas</h4>
                    <p>{orden.notas}</p>
                </div>
            )}

            {canCancel && onCancel && (
                <button
                    type="button"
                    className="profile-btn profile-btn--ghost order-detail__cancel"
                    onClick={() => onCancel(orden.id)}
                    disabled={cancelling}
                >
                    {cancelling ? 'Cancelando…' : 'Cancelar pedido'}
                </button>
            )}
        </div>
    );
}
