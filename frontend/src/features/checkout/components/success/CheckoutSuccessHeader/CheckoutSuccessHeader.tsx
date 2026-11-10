import clsx from 'clsx';
import styles from './CheckoutSuccessHeader.module.css';

type CheckoutSuccessHeaderProps = {
    orderId?: number | string;
    isBankTransfer?: boolean;
};

export default function CheckoutSuccessHeader({
    isBankTransfer = false,
}: CheckoutSuccessHeaderProps) {
    return (
        <div
            className={clsx(styles.root, isBankTransfer && styles.rootPending)}
            data-testid="success-header"
        >
            <div
                className={clsx(styles.icon, isBankTransfer && styles.iconPending)}
                aria-hidden="true"
            >
                {isBankTransfer ? '⏳' : '✓'}
            </div>
            <div className={styles.body}>
                <h1 className={styles.title}>
                    {isBankTransfer ? 'Pedido registrado — pago pendiente' : '¡Compra realizada con éxito!'}
                </h1>
            </div>
        </div>
    );
}
