import { useCheckout } from '@/app/providers';
import clsx from 'clsx';
import styles from './PickupBranchSelector.module.css';

interface PickupBranchSelectorProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export default function PickupBranchSelector({
    isExpanded = true,
}: PickupBranchSelectorProps) {
    const { sucursales, loadingBranches, selectedBranchId, setSelectedBranchId } = useCheckout();

    if (!isExpanded) {
        return null;
    }

    return (
        <div className={styles.root}>
            <div className={styles.headerText}>
                <h3 className={styles.title}>Sucursal de retiro</h3>
                <p className={styles.subtitle}>
                    Selecciona la sucursal donde retirarás tu pedido.
                </p>
            </div>

            {loadingBranches ? (
                <p className={styles.loadingState}>Cargando sucursales disponibles…</p>
            ) : sucursales.length === 0 ? (
                <p className={styles.emptyState}>No hay sucursales disponibles para retiro en este momento.</p>
            ) : (
                <ul className={styles.list} role="radiogroup" aria-label="Sucursales disponibles">
                    {sucursales.map((branch) => (
                        <li key={branch.id}>
                            <label
                                className={clsx(
                                    styles.card,
                                    selectedBranchId === branch.id && styles.cardSelected
                                )}
                            >
                                <input
                                    type="radio"
                                    name="sucursal"
                                    value={branch.id}
                                    checked={selectedBranchId === branch.id}
                                    onChange={() => setSelectedBranchId(branch.id)}
                                    className={styles.radioInput}
                                />
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <strong>{branch.nombre}</strong>
                                    </div>
                                    <div className={styles.cardDetails}>
                                        <span className={styles.cardLine}>{branch.direccion}</span>
                                        <span className={styles.cardMeta}>
                                            {branch.horario} · Tel: {branch.telefono}
                                        </span>
                                    </div>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
