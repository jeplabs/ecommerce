import styles from './CheckoutSuccessHeader.module.css';

type CheckoutSuccessHeaderProps = {
    orderId: number | string;
};

export default function CheckoutSuccessHeader({ orderId }: CheckoutSuccessHeaderProps) {
    return (
        <header className={styles.root}>
            <div className={styles.icon} aria-hidden="true">
                ✓
            </div>
            <h1 className={styles.title}>¡Compra realizada con éxito!</h1>
            <p className={styles.lead}>
                Tu pedido{' '}
                <span className={styles.orderId}>#{orderId}</span>{' '}
                fue registrado. Revisa el resumen de tu compra y el envío a continuación.
            </p>
        </header>
    );
}
