import { useCheckout } from '../../../context/CheckoutContext';
import './SimulatedStripeForm.css';

const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function SimulatedStripeForm() {
    const { cardData, updateCardField } = useCheckout();

    return (
        <div className="stripe-sim">
            <div className="stripe-sim__banner">
                <span className="stripe-sim__logo">Stripe</span>
                <span className="stripe-sim__badge">Modo demo</span>
            </div>

            <p className="stripe-sim__hint">
                Tarjeta de prueba: <code>4242 4242 4242 4242</code> · Cualquier fecha futura · CVC 123
            </p>

            <div className="checkout-field">
                <label htmlFor="cardholder">Titular de la tarjeta</label>
                <input
                    id="cardholder"
                    type="text"
                    autoComplete="cc-name"
                    value={cardData.cardholder}
                    onChange={(e) => updateCardField('cardholder', e.target.value)}
                    placeholder="Como aparece en la tarjeta"
                />
            </div>

            <div className="checkout-field">
                <label htmlFor="cardNumber">Número de tarjeta</label>
                <input
                    id="cardNumber"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardData.cardNumber}
                    onChange={(e) => updateCardField('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                />
            </div>

            <div className="stripe-sim__row">
                <div className="checkout-field">
                    <label htmlFor="expiry">Expiración</label>
                    <input
                        id="expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={cardData.expiry}
                        onChange={(e) => updateCardField('expiry', formatExpiry(e.target.value))}
                        placeholder="MM/AA"
                    />
                </div>
                <div className="checkout-field">
                    <label htmlFor="cvc">CVC</label>
                    <input
                        id="cvc"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cardData.cvc}
                        onChange={(e) => updateCardField('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                    />
                </div>
            </div>
        </div>
    );
}
