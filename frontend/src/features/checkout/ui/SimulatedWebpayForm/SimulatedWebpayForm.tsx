import clsx from 'clsx';
import styles from './SimulatedWebpayForm.module.css';

export default function SimulatedWebpayForm() {
    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>Webpay Plus</span>
                <span className={styles.badge}>Transbank · Demo</span>
            </div>

            <div className={styles.flow}>
                <div className={clsx(styles.step, styles.stepDone)}>1. Comercio</div>
                <span className={styles.arrow} aria-hidden="true">→</span>
                <div className={clsx(styles.step, styles.stepActive)}>2. Banco</div>
                <span className={styles.arrow} aria-hidden="true">→</span>
                <div className={styles.step}>3. Confirmación</div>
            </div>

            <p className={styles.text}>
                Al confirmar el pago se simulará la redirección a Transbank y la autorización
                del monto. No se realizará ningún cargo real.
            </p>

            <ul className={styles.features}>
                <li>Pago con tarjeta de crédito o débito</li>
                <li>Redirección segura simulada</li>
                <li>Comprobante con código de autorización</li>
            </ul>
        </div>
    );
}
