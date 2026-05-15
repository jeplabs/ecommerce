import { Link } from 'react-router-dom';
import { useCheckout } from '../../../context/CheckoutContext';
import './ShippingStep.css';

export default function ShippingStep() {
    const {
        direcciones,
        selectedAddressId,
        setSelectedAddressId,
        loadingAddresses,
        notas,
        setNotas,
    } = useCheckout();

    if (loadingAddresses) {
        return <p className="checkout-step__loading">Cargando direcciones…</p>;
    }

    if (direcciones.length === 0) {
        return (
            <div className="shipping-step__empty">
                <p>No tienes direcciones guardadas.</p>
                <p className="shipping-step__hint">
                    Agrega una dirección en tu perfil para continuar con la compra.
                </p>
                <Link to="/profile" className="checkout-btn checkout-btn--primary">
                    Ir a mis direcciones
                </Link>
            </div>
        );
    }

    return (
        <div className="shipping-step">
            <h2 className="checkout-step__title">Dirección de envío</h2>
            <p className="checkout-step__subtitle">Selecciona dónde quieres recibir tu pedido</p>

            <ul className="shipping-step__list" role="radiogroup" aria-label="Direcciones de envío">
                {direcciones.map((dir) => (
                    <li key={dir.id}>
                        <label
                            className={`shipping-step__card ${selectedAddressId === dir.id ? 'shipping-step__card--selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="direccion"
                                value={dir.id}
                                checked={selectedAddressId === dir.id}
                                onChange={() => setSelectedAddressId(dir.id)}
                            />
                            <div className="shipping-step__card-body">
                                <div className="shipping-step__card-header">
                                    <strong>{dir.alias}</strong>
                                    {dir.principal && (
                                        <span className="shipping-step__badge">Principal</span>
                                    )}
                                </div>
                                <p>{dir.direccion}</p>
                                <p>{dir.ciudad}, {dir.estado} {dir.codigoPostal}</p>
                                <p>{dir.pais} · {dir.telefono}</p>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            <div className="checkout-field">
                <label htmlFor="notas">Notas para el pedido (opcional)</label>
                <textarea
                    id="notas"
                    rows={3}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Instrucciones de entrega, horario preferido…"
                    maxLength={500}
                />
            </div>

            <Link to="/profile" className="shipping-step__link">
                Gestionar direcciones en mi perfil
            </Link>
        </div>
    );
}
