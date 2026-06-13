import clsx from 'clsx';
import { Link } from 'react-router-dom';
import styles from './CheckoutSuccessActions.module.css';

export default function CheckoutSuccessActions() {
    return (
        <nav className={styles.root} aria-label="Acciones tras la compra">
            <p className={styles.hint}>
                Guardamos tu pedido en el historial. Puedes consultar el estado cuando quieras.
            </p>
            <Link
                to="/profile/ordenes"
                className={clsx(styles.btn, styles.btnPrimary)}
            >
                Ver historial de compras
            </Link>
            <Link
                to="/catalogo"
                className={clsx(styles.btn, styles.btnSecondary)}
            >
                Seguir comprando
            </Link>
            <Link to="/" className={clsx(styles.btn, styles.btnGhost)}>
                Volver al inicio
            </Link>
        </nav>
    );
}
