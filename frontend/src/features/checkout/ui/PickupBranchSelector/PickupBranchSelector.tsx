import { useState } from 'react';
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

export default function PickupBranchSelector() {
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

    return (
        <div className={styles.root}>
            <h2 className={sharedStyles.stepTitle}>Sucursal de retiro</h2>
            <p className={sharedStyles.stepSubtitle}>
                Selecciona la sucursal donde retirarás tu pedido.
            </p>

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
                            />
                            <div className={styles.cardBody}>
                                <div className={styles.cardHeader}>
                                    <strong>{branch.nombre}</strong>
                                </div>
                                <p className={styles.cardLine}>{branch.direccion}</p>
                                <p className={styles.cardMeta}>{branch.horario}</p>
                                <p className={styles.cardMeta}>Tel: {branch.telefono}</p>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
}