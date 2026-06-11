import { useCheckout } from '@/app/providers';
import clsx from 'clsx';

import { PAYMENT_METHODS } from '@/features/checkout';
import SimulatedStripeForm from '../SimulatedStripeForm/SimulatedStripeForm';
import SimulatedWebpayForm from '../SimulatedWebpayForm/SimulatedWebpayForm';
import sharedStyles from '../checkoutShared.module.css';
import styles from './PaymentStep.module.css';

export default function PaymentStep() {
    const { paymentMethod, setPaymentMethod } = useCheckout();

    return (
        <div>
            <h2 className={sharedStyles.stepTitle}>Método de pago</h2>
            <p className={sharedStyles.stepSubtitle}>
                Elige cómo pagar. En este entorno el pago es simulado (sin cargos reales).
            </p>

            <div className={styles.methods}>
                <button
                    type="button"
                    className={clsx(
                        styles.method,
                        paymentMethod === PAYMENT_METHODS.STRIPE && styles.methodActive
                    )}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.STRIPE)}
                >
                    <span className={styles.methodIcon}>💳</span>
                    <span className={styles.methodInfo}>
                        <strong>Tarjeta (Stripe)</strong>
                        <small>Visa, Mastercard, Amex</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={clsx(
                        styles.method,
                        paymentMethod === PAYMENT_METHODS.WEBPAY && styles.methodActive
                    )}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.WEBPAY)}
                >
                    <span className={styles.methodIcon}>🏦</span>
                    <span className={styles.methodInfo}>
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
