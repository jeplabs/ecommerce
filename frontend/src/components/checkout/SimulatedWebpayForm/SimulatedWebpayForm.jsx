import './SimulatedWebpayForm.css';

export default function SimulatedWebpayForm() {
    return (
        <div className="webpay-sim">
            <div className="webpay-sim__banner">
                <span className="webpay-sim__logo">Webpay Plus</span>
                <span className="webpay-sim__badge">Transbank · Demo</span>
            </div>

            <div className="webpay-sim__flow">
                <div className="webpay-sim__step webpay-sim__step--done">1. Comercio</div>
                <span className="webpay-sim__arrow" aria-hidden="true">→</span>
                <div className="webpay-sim__step webpay-sim__step--active">2. Banco</div>
                <span className="webpay-sim__arrow" aria-hidden="true">→</span>
                <div className="webpay-sim__step">3. Confirmación</div>
            </div>

            <p className="webpay-sim__text">
                Al confirmar el pago se simulará la redirección a Transbank y la autorización
                del monto. No se realizará ningún cargo real.
            </p>

            <ul className="webpay-sim__features">
                <li>Pago con tarjeta de crédito o débito</li>
                <li>Redirección segura simulada</li>
                <li>Comprobante con código de autorización</li>
            </ul>
        </div>
    );
}
