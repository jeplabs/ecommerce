import { useCheckout } from '@/app/providers';
import clsx from 'clsx';

import { PAYMENT_METHODS } from '@/features/checkout';
import { isExpressService, isPickupService } from '@/entities/shipping';
import { formatCurrency } from '@/shared/lib/format';
import SimulatedQPayProForm from '../SimulatedQPayProForm/SimulatedQPayProForm';
import SimulatedWebpayForm from '../SimulatedWebpayForm/SimulatedWebpayForm';
// import SimulatedMercadoPagoForm from '../SimulatedMercadoPagoForm/SimulatedMercadoPagoForm';
import SimulatedBankTransferForm from '../SimulatedBankTransferForm/SimulatedBankTransferForm';
import ContraEntregaForm from '../ContraEntregaForm/ContraEntregaForm';
import { isBankTransferPaymentMethod } from '@/features/checkout/model/schemas/payment';
import sharedStyles from '../checkoutShared.module.css';
import styles from './PaymentStep.module.css';

export default function PaymentStep() {
    const { paymentMethod, setPaymentMethod, orderTotal, selectedServicio } = useCheckout();
    const isExpress = isExpressService(selectedServicio);
    const isPickup = isPickupService(selectedServicio);
    const isContraEntregaDisabled = isExpress || isPickup;

    return (
        <div>
            <h2 className={sharedStyles.stepTitle}>Método de pago</h2>
            <div className={sharedStyles.stepSubtitle}>
                <p>
                    Total a pagar: <strong>{formatCurrency(orderTotal)}</strong>
                    {paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA
                        ? ' (productos + envío, pago al recibir). '
                        : ' (productos + servicio de envío). '}
                </p>
                <p>
                    {isBankTransferPaymentMethod(paymentMethod)
                        ? 'Con transferencia el pedido queda pendiente hasta validar el comprobante.'
                        : paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA
                        ? 'El cobro se realiza al entregar el pedido.'
                        : paymentMethod === PAYMENT_METHODS.WEBPAY
                            ? 'Serás redirigido al sitio seguro de Webpay Plus (Transbank) para completar el pago.'
                            : paymentMethod === PAYMENT_METHODS.QPAYPRO
                                ? 'Serás redirigido al sitio seguro de QPayPro (Guatemala) para completar el pago.'
                                : 'El pago es simulado en este entorno (sin cargos reales).'}
                </p>
            </div>

            <div className={styles.methods}>
                {/* <button
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
                </button> */}
                <button
                    type="button"
                    className={clsx(
                        styles.method,
                        paymentMethod === PAYMENT_METHODS.QPAYPRO && styles.methodActive
                    )}
                    onClick={() => setPaymentMethod(PAYMENT_METHODS.QPAYPRO)}
                >
                    <span className={styles.methodIcon}>💳</span>
                    <span className={styles.methodInfo}>
                        <strong>QPayPro</strong>
                        <small>Visa, Mastercard · Guatemala</small>
                    </span>
                </button>

                {/* <button
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
                </button> */}

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
                        <small>Depósito · Pago pendiente, enviar comprobante</small>
                    </span>
                </button>

                {!isContraEntregaDisabled ? (
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
                            <small>Entrega en destino · Pago al recibir el pedido</small>
                        </span>
                    </button>
                ) : (
                    <div className={styles.methodDisabled}>
                        <span className={styles.methodIcon}>✉️</span>
                        <span className={styles.methodInfo}>
                            <strong>Contra entrega</strong>
                            <span className={styles.expressBadge}>
                                {isPickup ? 'No aplica para retiro en tienda' : 'No aplica para contra entrega'}
                            </span>
                        </span>
                    </div>
                )}
            </div>

            {paymentMethod === PAYMENT_METHODS.QPAYPRO && <SimulatedQPayProForm />}
            {paymentMethod === PAYMENT_METHODS.WEBPAY && <SimulatedWebpayForm />}
            {/* {paymentMethod === PAYMENT_METHODS.MERCADOPAGO && <SimulatedMercadoPagoForm />} */}
            {paymentMethod === PAYMENT_METHODS.BANK_TRANSFER && <SimulatedBankTransferForm />}
            {paymentMethod === PAYMENT_METHODS.CONTRA_ENTREGA && <ContraEntregaForm />}
        </div>
    );
}
