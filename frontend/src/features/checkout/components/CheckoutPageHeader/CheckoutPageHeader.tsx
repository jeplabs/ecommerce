import { Link } from 'react-router-dom';
import styles from './CheckoutPageHeader.module.css';

export type CheckoutPageHeaderProps = {
    backTo?: string;
    backLabel?: string;
    title?: string;
};

export function CheckoutPageHeader({
    backTo = '/cart',
    backLabel = '← Volver al carrito',
    title = 'Checkout',
}: CheckoutPageHeaderProps) {
    return (
        <header className={styles.header}>
            <Link to={backTo} className={styles.back}>
                {backLabel}
            </Link>
            <h1>{title}</h1>
        </header>
    );
}

export default CheckoutPageHeader;
