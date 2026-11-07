import { useCart, useToast } from '@/app/providers';
import clsx from 'clsx';
import styles from './CartExpirationBanner.module.css';

function formatTimer(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CartExpirationBanner() {
    const { expiracion, segundosRestantes, renovarCart, loading, isEmpty } = useCart();
    const { showSuccess, showError } = useToast();

    if (isEmpty || !expiracion || segundosRestantes === null || segundosRestantes <= 0) {
        return null;
    }

    const warningThreshold = expiracion.avisoSegundosAntes || 600;
    const isWarning = segundosRestantes <= warningThreshold;
    const isCritical = segundosRestantes <= 180; // 3 minutos

    // Si aún falta mucho tiempo para el aviso, no mostramos banner o mostramos aviso discreto
    if (!isWarning) {
        return null;
    }

    const handleRenew = async () => {
        const result = await renovarCart();
        if (result.success) {
            showSuccess('Tiempo de carrito extendido');
        } else if (result.error) {
            showError(result.error);
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
        >
            <div className={styles.info}>
                <span className={clsx('material-symbols-outlined', styles.icon)}>
                    {isCritical ? 'timer_off' : 'schedule'}
                </span>
                <span className={styles.text}>
                    Reserva vence en{' '}
                    <span className={styles.timer}>{formatTimer(segundosRestantes)}</span>
                </span>
            </div>
            <button
                type="button"
                className={styles.renewBtn}
                onClick={handleRenew}
                disabled={loading}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                    update
                </span>
                Extender tiempo
            </button>
        </div>
    );
}
