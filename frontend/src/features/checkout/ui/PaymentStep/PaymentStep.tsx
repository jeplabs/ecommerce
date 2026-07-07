import { useCheckout } from '@/app/providers';
import clsx from 'clsx';

import { PAYMENT_METHODS } from '@/features/checkout';
import { formatCurrency } from '@/shared/lib/format';
import SimulatedStripeForm from '../SimulatedStripeForm/SimulatedStripeForm';
import SimulatedWebpayForm from '../SimulatedWebpayForm/SimulatedWebpayForm';
import SimulatedMercadoPagoForm from '../SimulatedMercadoPagoForm/SimulatedMercadoPagoForm';
import SimulatedBankTransferForm from '../SimulatedBankTransferForm/SimulatedBankTransferForm';
import ContraEntregaForm from '../ContraEntregaForm/ContraEntregaForm';
import { isBankTransferPaymentMethod } from '@/features/checkout/model/schemas/payment';
import sharedStyles from '../checkoutShared.module.css';
import styles from './PaymentStep.module.css';

export default function PaymentStep() {
    const { paymentMethod, setPaymentMethod, orderTotal, selectedServicioCostos } = useCheckout();

    return (
        <div>
            <h2 className={sharedStyles.stepTitle}>Método de pago</h2>
            <p className={sharedStyles.stepSubtitle}>
                Total a pagar: <strong>{formatCurrency(orderTotal)}</strong>
                {paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA
                    ? ' (productos + envío con recargo por contraentrega).'
                    : ' (productos + envío en línea).'}
                {isBankTransferPaymentMethod(paymentMethod)
                    ? ' Con transferencia el pedido queda pendiente hasta validar el comprobante.'
                    : paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA
                      ? ' El cobro se realiza al entregar el pedido.'
                      : ' El pago es simulado en este entorno (sin cargos reales).'}
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
                        paymentMethod === PAYMENT_METHODS.MERCADOPAGO && styles.methodActive
                    )}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.MERCADOPAGO)}
                >
                    <span className={styles.methodIcon}>🤝</span>
                    <span className={styles.methodInfo}>
                        <strong>Mercado Pago</strong>
                        <small>Latam · Tarjeta o saldo</small>
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

                <button
                    type="button"
                    className={clsx(
                        styles.method,
                        paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && styles.methodActive
                    )}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.BANK_TRANSFER)}
                >
                    <span className={styles.methodIcon}>🏛️</span>
                    <span className={styles.methodInfo}>
                        <strong>Transferencia bancaria</strong>
                        <small>Depósito · Pago pendiente y envío de comprobante</small>
                    </span>
                </button>
                <button
                    type="button"
                    className={clsx(
                        styles.method,
                        paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA && styles.methodActive
                    )}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.CONTRA_ENTREGA)}
                >
                    <span className={styles.methodIcon}>✉️</span>
                    <span className={styles.methodInfo}>
                        <strong>Contra entrega</strong>
                        <small>Entrega en destino · Pago en efectivo con recargo</small>
                    </span>
                </button>
            </div>

            {paymentMethod === PAYMENT_METHODS.STRIPE && <SimulatedStripeForm />}
            {paymentMethod === PAYMENT_METHODS.WEBPAY && <SimulatedWebpayForm />}
            {paymentMethod === PAYMENT_METHODS.MERCADOPAGO && <SimulatedMercadoPagoForm />}
            {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && <SimulatedBankTransferForm />}
            {paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA && (
                <ContraEntregaForm recargo={selectedServicioCostos.recargo} />
            )}
        </div>
    );
}
