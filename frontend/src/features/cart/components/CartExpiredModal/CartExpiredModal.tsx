import { useCart, useToast } from '@/app/providers';
import { Button } from '@/shared/ui/Button';
import styles from './CartExpiredModal.module.css';

function formatMotivo(motivo: string, solicitada?: number, restaurada?: number): string {
    switch (motivo) {
        case 'SIN_STOCK':
            return 'Sin stock disponible';
        case 'STOCK_PARCIAL':
            return `Stock parcial (se restauraron ${restaurada} de ${solicitada})`;
        case 'NO_DISPONIBLE':
            return 'Producto no disponible';
        case 'SIN_PRECIO':
            return 'Precio no vigente';
        default:
            return motivo;
    }
}

export default function CartExpiredModal() {
    const {
        showExpiredModal,
        closeExpiredModal,
        restaurarCart,
        itemsNoRestaurados,
        loading,
    } = useCart();

    const { showSuccess, showError } = useToast();

    if (!showExpiredModal) return null;

    const handleRestaurar = async () => {
        const result = await restaurarCart();
        if (result.success) {
            if (result.itemsNoRestaurados.length > 0) {
                showSuccess('Carrito restaurado con ajustes de disponibilidad');
            } else {
                showSuccess('Tus productos han sido restaurados al carrito');
            }
        } else if (result.error) {
            showError(result.error);
        }
    };

    return (
        <div className={styles.overlay} onClick={closeExpiredModal} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.titleContainer}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>history_toggle_off</span>
                        <h3 className={styles.title}>Tu carrito ha expirado por inactividad</h3>
                    </div>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={closeExpiredModal}
                        aria-label="Cerrar aviso"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.body}>
                    {/* <p className={styles.description}>
                        Tu carrito de compra expiró por inactividad. 
                    </p> */}
                    <p className={styles.description}>
                        Los precios o la disponibilidad de algunos
                        productos pueden haber cambiado mientras estabas ausente.
                    </p>
                    <p className={styles.description}>
                        Puedes restaurar tus productos
                        con la disponibilidad y precios vigentes actuales o puedes continuar sin restaurar.
                    </p>

                    {itemsNoRestaurados.length > 0 && (
                        <div className={styles.unrestoredBox}>
                            <h4 className={styles.unrestoredTitle}>Ajustes en la última restauración:</h4>
                            <ul className={styles.unrestoredList}>
                                {itemsNoRestaurados.map((item, index) => (
                                    <li key={index}>
                                        <strong>{item.nombre}</strong> —{' '}
                                        <span className={styles.reasonBadge}>
                                            {formatMotivo(
                                                item.motivo,
                                                item.cantidadSolicitada,
                                                item.cantidadRestaurada
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={closeExpiredModal} disabled={loading}>
                        Continuar sin restaurar
                    </Button>
                    <Button variant="primary" onClick={handleRestaurar} disabled={loading}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                            restore
                        </span>
                        Restaurar mis productos
                    </Button>
                </div>
            </div>
        </div>
    );
}
