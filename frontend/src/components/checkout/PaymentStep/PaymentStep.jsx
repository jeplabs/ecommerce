import { useCheckout } from '../../../context/CheckoutContext';
import { PAYMENT_METHODS } from '../../../services/paymentService';
import SimulatedStripeForm from '../SimulatedStripeForm/SimulatedStripeForm';
import SimulatedWebpayForm from '../SimulatedWebpayForm/SimulatedWebpayForm';
import './PaymentStep.css';

export default function PaymentStep() {
    const { paymentMethod, setPaymentMethod } = useCheckout();

    return (
        <div className="payment-step">
            <h2 className="checkout-step__title">Método de pago</h2>
            <p className="checkout-step__subtitle">
                Elige cómo pagar. En este entorno el pago es simulado (sin cargos reales).
            </p>

            <div className="payment-step__methods">
                <button
                    type="button"
                    className={`payment-method ${paymentMethod === PAYMENT_METHODS.STRIPE ? 'payment-method--active' : ''}`}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.STRIPE)}
                >
                    <span className="payment-method__icon">💳</span>
                    <span className="payment-method__info">
                        <strong>Tarjeta (Stripe)</strong>
                        <small>Visa, Mastercard, Amex</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={`payment-method ${paymentMethod === PAYMENT_METHODS.WEBPAY ? 'payment-method--active' : ''}`}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.WEBPAY)}
                >
                    <span className="payment-method__icon">🏦</span>
                    <span className="payment-method__info">
                        <strong>Webpay Plus</strong>
                        <small>Transbank · Chile</small>
                    </span>
                </button>
            </div>

            {paymentMethod === PAYMENT_METHODS.STRIPE && <SimulatedStripeForm />}
            {paymentMethod === PAYMENT_METHODS.WEBPAY && <SimulatedWebpayForm />}
        </div>
    );
}
