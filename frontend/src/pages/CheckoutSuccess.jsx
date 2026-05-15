import { Link, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar/Navbar';
import Footer from '../components/layout/Footer/Footer';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '../utils/formatters';
import './CheckoutSuccess.css';

export default function CheckoutSuccess() {
    const location = useLocation();
    const { orden, payment } = location.state || {};

    if (!orden) {
        return <Navigate to="/catalogo" replace />;
    }

    return (
        <>
            <Navbar />
            <main className="checkout-success">
                <div className="checkout-success__card">
                    <div className="checkout-success__icon" aria-hidden="true">✓</div>

                    <h1>¡Pedido confirmado!</h1>
                    <p className="checkout-success__lead">
                        Tu orden <strong>#{orden.id}</strong> fue registrada correctamente.
                    </p>

                    <dl className="checkout-success__details">
                        <div>
                            <dt>Estado</dt>
                            <dd>{formatEstadoOrden(orden.estado)}</dd>
                        </div>
                        <div>
                            <dt>Total</dt>
                            <dd>{formatCurrency(orden.total)}</dd>
                        </div>
                        <div>
                            <dt>Fecha</dt>
                            <dd>{formatDateTime(orden.creadoAt)}</dd>
                        </div>
                        {payment && (
                            <>
                                <div>
                                    <dt>Pago</dt>
                                    <dd>{payment.provider}</dd>
                                </div>
                                <div>
                                    <dt>Referencia</dt>
                                    <dd className="checkout-success__ref">{payment.transactionId}</dd>
                                </div>
                            </>
                        )}
                    </dl>

                    <div className="checkout-success__actions">
                        <Link to="/profile" state={{ tab: 'ordenes' }} className="checkout-btn checkout-btn--primary">
                            Ver mis pedidos
                        </Link>
                        <Link to="/catalogo" className="checkout-btn checkout-btn--secondary">
                            Seguir comprando
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
