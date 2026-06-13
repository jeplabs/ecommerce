import { Link } from 'react-router-dom';
import styles from './checkoutPage.module.css';

type CheckoutPageHeaderProps = {
    backTo?: string;
    backLabel?: string;
};

export default function CheckoutPageHeader({
    backTo = '/cart',
    backLabel = '← Volver al carrito',
}: CheckoutPageHeaderProps) {
    return (
        <header className={styles.header}>
            <Link to={backTo} className={styles.back}>
                {backLabel}
            </Link>
            <h1>Checkout</h1>
            <p>Tres pasos: pedido y envío, pago y confirmación.</p>
        </header>
    );
}
