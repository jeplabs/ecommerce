import { useCheckout } from '@/app/providers';
import clsx from 'clsx';

import { FORMA_PAGO_ENVIO } from '@/entities/order';
import type { FormaPago } from '@/entities/order';
import styles from './ShippingPaymentSelector.module.css';

const OPTIONS: Array<{ value: FormaPago; title: string; description: string }> = [
    {
        value: FORMA_PAGO_ENVIO.EN_LINEA,
        title: 'Pagar envío en línea',
        description: 'El costo de entrega se suma al total que pagarás en el siguiente paso.',
    },
    {
        value: FORMA_PAGO_ENVIO.CONTRA_ENTREGA,
        title: 'Pagar envío contra entrega',
        description:
            'Pagas el envío (tarifa + recargo) al recibir el pedido. No se incluye en el total a pagar ahora.',
    },
];

export default function ShippingPaymentSelector() {
    const { formaPagoEnvio, setFormaPagoEnvio } = useCheckout();

    return (
        <section className={styles.root} aria-labelledby="shipping-payment-title">
            <h2 id="shipping-payment-title" className={styles.title}>
                Pago del envío
            </h2>
            <p className={styles.subtitle}>
                Elige cómo pagar el costo de entrega. Los productos se pagan en el paso de pago.
            </p>

            <ul className={styles.list} role="radiogroup" aria-label="Pago del envío">
                {OPTIONS.map((opt) => {
                    const isSelected = formaPagoEnvio === opt.value;
                    return (
                        <li key={opt.value}>
                            <label
                                className={clsx(
                                    styles.card,
                                    isSelected && styles.cardSelected
                                )}
                            >
                                <input
                                    type="radio"
                                    name="forma-pago-envio"
                                    value={opt.value}
                                    checked={isSelected}
                                    onChange={() => setFormaPagoEnvio(opt.value)}
                                />
                                <div className={styles.body}>
                                    <strong>{opt.title}</strong>
                                    <p>{opt.description}</p>
                                </div>
                            </label>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
