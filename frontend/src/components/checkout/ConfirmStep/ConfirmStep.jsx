import { useCheckout } from '../../../context/CheckoutContext';
import { PAYMENT_METHODS } from '../../../services/paymentService';
import { formatCurrency } from '../../../utils/formatters';
import './ConfirmStep.css';

export default function ConfirmStep() {
    const {
        selectedAddress,
        selectedServicio,
        isPickupSelected,
        paymentMethod,
        cartTotal,
        shippingCost,
        orderTotal,
        envioOpciones,
        notas,
        cardData,
    } = useCheckout();

    const paymentLabel =
        paymentMethod === PAYMENT_METHODS.STRIPE
            ? `Tarjeta ·••• ${(cardData.cardNumber || '').replace(/\s/g, '').slice(-4) || '****'}`
            : 'Webpay Plus (Transbank)';

    if (!selectedAddress) {
        return <p className="checkout-step__loading">Cargando datos…</p>;
    }

    return (
        <div className="confirm-step">
            <h2 className="checkout-step__title">Confirmar pedido</h2>
            <p className="checkout-step__subtitle">Revisa los datos antes de pagar</p>

            <div className="confirm-step__block">
                <h3>Entrega</h3>
                {selectedServicio && (
                    <p>
                        <strong>{selectedServicio.nombre}</strong>
                        {envioOpciones?.envioGratis ? (
                            <> · <span className="confirm-step__free">Envío gratis</span></>
                        ) : (
                            <> · {formatCurrency(shippingCost)}</>
                        )}
                    </p>
                )}
                {isPickupSelected ? (
                    <p className="confirm-step__pickup-hint">Retiro en tienda</p>
                ) : (
                    <>
                        <p><strong>{selectedAddress.alias}</strong></p>
                        <p>{selectedAddress.direccion}</p>
                        <p>
                            {selectedAddress.ciudad}, {selectedAddress.estado}{' '}
                            {selectedAddress.codigoPostal}
                        </p>
                        <p>{selectedAddress.pais} · {selectedAddress.telefono}</p>
                    </>
                )}
                {isPickupSelected && (
                    <p className="confirm-step__contact">
                        Contacto: {selectedAddress.alias} · {selectedAddress.telefono}
                    </p>
                )}
            </div>

            <div className="confirm-step__block">
                <h3>Pago</h3>
                <p>{paymentLabel}</p>
                <p className="confirm-step__amount">
                    Subtotal: {formatCurrency(cartTotal)}
                    {!envioOpciones?.envioGratis && shippingCost > 0 && (
                        <> · Envío: {formatCurrency(shippingCost)}</>
                    )}
                </p>
                <p className="confirm-step__amount">
                    Total a pagar: <strong>{formatCurrency(orderTotal)}</strong>
                </p>
            </div>

            {notas.trim() && (
                <div className="confirm-step__block">
                    <h3>Notas</h3>
                    <p>{notas}</p>
                </div>
            )}

            <p className="confirm-step__disclaimer">
                Al hacer clic en «Pagar y confirmar» se procesará el pago simulado y se creará tu orden en el sistema.
            </p>
        </div>
    );
}
