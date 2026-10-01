import { useCheckout } from '@/app/providers';
import clsx from 'clsx';
import sharedStyles from '../checkoutShared.module.css';
import styles from './PickupBranchSelector.module.css';

const MOCK_BRANCHES = [
    {
        id: 1,
        nombre: 'Tienda Centro',
        direccion: 'Av. Principal 123, Ciudad de Guatemala',
        horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00',
        telefono: '+502 2345-6789',
    },
    {
        id: 2,
        nombre: 'Tienda Zona 10',
        direccion: 'Boulevard Los Proceres 5-50, Zona 10',
        horario: 'Lun-Vie: 10:00-19:00, Sáb: 10:00-14:00',
        telefono: '+502 2456-7890',
    },
];

interface PickupBranchSelectorProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

export default function PickupBranchSelector({
    isExpanded = true,
    onToggle,
}: PickupBranchSelectorProps) {
    const { selectedBranchId, setSelectedBranchId } = useCheckout();

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

            <ul className={styles.list} role="radiogroup" aria-label="Sucursales disponibles">
                {MOCK_BRANCHES.map((branch) => (
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
        </div>
    );
}