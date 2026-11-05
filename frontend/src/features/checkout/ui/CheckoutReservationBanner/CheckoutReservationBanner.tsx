import { useContext } from 'react';
import { CartContext } from '@/app/providers/cart-context';
import { ToastContext } from '@/app/providers/toast-context';
import clsx from 'clsx';
import styles from './CheckoutReservationBanner.module.css';

function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CheckoutReservationBanner() {
    const cart = useContext(CartContext);
    const toast = useContext(ToastContext);

    if (!cart) {
        return null;
    }

    const { expiracion, segundosRestantes, renovarCart, loading, isEmpty } = cart;

    if (isEmpty || !expiracion || segundosRestantes === null || segundosRestantes <= 0) {
        return null;
    }

    const warningThreshold = expiracion.avisoSegundosAntes || 600;
    const isWarning = segundosRestantes <= warningThreshold;
    const isCritical = segundosRestantes <= 180; // últimos 3 minutos

    const handleRenew = async () => {
        const result = await renovarCart();
        if (result.success) {
            toast?.showSuccess('Reserva extendida exitosamente');
        } else if (result.error) {
            toast?.showError(result.error);
        }
    };

    return (
        <div
            className={clsx(
                styles.banner,
                isCritical
                    ? styles.bannerCritical
                    : isWarning
                    ? styles.bannerWarning
                    : styles.bannerNormal
            )}
            role="status"
            aria-live="polite"
        >
            <div className={styles.info}>
                <span className={clsx('material-symbols-outlined', styles.icon)}>
                    {isCritical ? 'timer_off' : 'schedule'}
                </span>
                <span className={styles.text}>
                    Reserva: <span className={styles.timer}>{formatTimer(segundosRestantes)}</span>
                </span>
            </div>

            {isWarning && (
                <button
                    type="button"
                    className={styles.renewBtn}
                    onClick={handleRenew}
                    disabled={loading}
                    title="Extender tiempo de reserva"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>
                        update
                    </span>
                    Extender
                </button>
            )}
        </div>
    );
}
