import { useCheckout } from '@/app/providers';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import sharedStyles from '../checkoutShared.module.css';
import styles from '../ShippingStep/ShippingStep.module.css';

interface ShippingAddressSelectorProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}

/**
 * Paso 1: dirección + servicio de entrega (+ notas).
 * Los ítems del pedido se muestran en el resumen lateral.
 */
export default function ShippingAddressSelector({
    isExpanded = true,
    onToggle,
}: ShippingAddressSelectorProps) {
    const {
        direcciones,
        selectedAddressId,
        setSelectedAddressId,
        loadingAddresses,
        notas,
        setNotas,
    } = useCheckout();

    if (loadingAddresses) {
        return <p className={sharedStyles.stepLoading}>Cargando direcciones…</p>;
    }

    if (direcciones.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No tienes direcciones guardadas.</p>
                <p className={styles.hint}>
                    Agrega una dirección en tu perfil para continuar con la compra.
                </p>
                <Link to="/profile/direcciones" className={clsx(sharedStyles.btn, sharedStyles.btnPrimary)}>
                    Ir a mis direcciones
                </Link>
            </div>
        );
    }

    if (!isExpanded) {
        return null;
    }

    return (
        <div className={styles.shippingAddressSelector}>
            <div className={styles.headerText}>
                <h3 className={styles.title}>Dirección de entrega</h3>
                <p className={styles.subtitle}>
                    Selecciona dónde recibir el pedido.
                </p>
            </div>

            <ul className={styles.list} role="radiogroup" aria-label="Direcciones de envío">
                {direcciones.map((dir) => (
                    <li key={dir.id}>
                        <label
                            className={clsx(
                                styles.card,
                                selectedAddressId === dir.id && styles.cardSelected
                            )}
                        >
                            <input
                                type="radio"
                                name="direccion"
                                value={dir.id}
                                checked={selectedAddressId === dir.id}
                                onChange={() => setSelectedAddressId(dir.id)}
                                className={styles.radioInput}
                            />
                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <strong>{dir.alias}</strong>
                                    {dir.principal && (
                                        <span className={styles.badge}>Principal</span>
                                    )}
                                </div>
                                <div className={styles.cardDetails}>
                                    <span className={styles.cardLine}>{dir.direccion}</span>
                                    <span className={styles.cardMeta}>
                                        {dir.ciudad}, {dir.estado} {dir.codigoPostal}
                                        {dir.telefono ? ` · Tel: ${dir.telefono}` : ''}
                                    </span>
                                </div>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            <div className={styles.fieldNotes}>
                <label htmlFor="notas">Notas para el pedido (opcional)</label>
                <textarea
                    id="notas"
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Instrucciones de entrega, horario preferido…"
                    maxLength={500}
                />
            </div>

            <Link to="/profile/direcciones" className={styles.link}>
                + Gestionar direcciones
            </Link>
        </div>
    );
}
