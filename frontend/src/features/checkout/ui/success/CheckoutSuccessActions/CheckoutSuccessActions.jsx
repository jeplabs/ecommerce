import { Link } from 'react-router-dom';
import './CheckoutSuccessActions.css';

export default function CheckoutSuccessActions() {
    return (
        <nav className="checkout-success-actions" aria-label="Acciones tras la compra">
            <p className="checkout-success-actions__hint">
                Guardamos tu pedido en el historial. Puedes consultar el estado cuando quieras.
            </p>
            <Link
                to="/profile"
                state={{ tab: 'ordenes' }}
                className="checkout-success-actions__btn checkout-success-actions__btn--primary"
            >
                Ver historial de compras
            </Link>
            <Link
                to="/catalogo"
                className="checkout-success-actions__btn checkout-success-actions__btn--secondary"
            >
                Seguir comprando
            </Link>
            <Link to="/" className="checkout-success-actions__btn checkout-success-actions__btn--ghost">
                Volver al inicio
            </Link>
        </nav>
    );
}
