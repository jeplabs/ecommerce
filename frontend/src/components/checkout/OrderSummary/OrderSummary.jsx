import { formatCurrency } from '../../../utils/formatters';
import './OrderSummary.css';

export default function OrderSummary({ items, total, compact = false }) {
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

            <div className="order-summary__total">
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
            </div>

            <p className="order-summary__note">Precios con IVA incluido</p>
        </aside>
    );
}
