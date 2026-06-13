import clsx from 'clsx';
import styles from './CheckoutSuccessHeader.module.css';

type CheckoutSuccessHeaderProps = {
    orderId: number | string;
    isBankTransfer?: boolean;
};

export default function CheckoutSuccessHeader({
    orderId,
    isBankTransfer = false,
}: CheckoutSuccessHeaderProps) {
    return (
        <header className={styles.root}>
            <div
                className={clsx(styles.icon, isBankTransfer && styles.iconPending)}
                aria-hidden="true"
            >
                {isBankTransfer ? '⏳' : '✓'}
            </div>
            <h1 className={styles.title}>
                {isBankTransfer ? 'Pedido registrado — pago pendiente' : '¡Compra realizada con éxito!'}
            </h1>
            <p className={styles.lead}>
                Tu pedido <span className={styles.orderId}>#{orderId}</span>{' '}
                {isBankTransfer
                    ? 'quedó en estado pendiente. Transfiere el monto y sube el comprobante desde tu historial de pedidos.'
                    : 'fue registrado. Revisa el resumen de tu compra y el envío a continuación.'}
            </p>
        </header>
    );
}
