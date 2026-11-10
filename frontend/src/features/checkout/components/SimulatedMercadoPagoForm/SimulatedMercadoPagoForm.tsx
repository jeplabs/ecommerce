import clsx from 'clsx';
import styles from './SimulatedMercadoPagoForm.module.css';

export default function SimulatedMercadoPagoForm() {
    return (
        <div className={styles.root}>
            <div className={styles.banner}>
                <span className={styles.logo}>Mercado Pago</span>
                <span className={styles.badge}>Checkout Pro · Demo</span>
            </div>

            <div className={styles.flow}>
                <div className={clsx(styles.step, styles.stepDone)}>1. Tienda</div>
                <span className={styles.arrow} aria-hidden="true">
                    →
                </span>
                <div className={clsx(styles.step, styles.stepActive)}>2. Mercado Pago</div>
                <span className={styles.arrow} aria-hidden="true">
                    →
                </span>
                <div className={styles.step}>3. Confirmación</div>
            </div>

            <p className={styles.text}>
                Al confirmar el pago se simulará la redirección a Mercado Pago (tarjeta, saldo en
                cuenta o cuotas). No se realizará ningún cargo real.
            </p>

            <ul className={styles.features}>
                <li>Tarjetas de crédito y débito</li>
                <li>Dinero en cuenta Mercado Pago</li>
                <li>Cuotas sin tarjeta (simulado)</li>
            </ul>

            <p className={styles.hint}>
                En producción usarías Checkout Pro o Payment Brick. Tarjeta de prueba aprobada:{' '}
                <code>5031 4332 1540 6351</code>
            </p>
        </div>
    );
}
