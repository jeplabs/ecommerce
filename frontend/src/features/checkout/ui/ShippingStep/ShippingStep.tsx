import { useCheckout } from '@/app/providers';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

import ShippingServiceSelector from '../ShippingServiceSelector/ShippingServiceSelector';
import ShippingPaymentSelector from '../ShippingPaymentSelector/ShippingPaymentSelector';
import sharedStyles from '../checkoutShared.module.css';
import styles from './ShippingStep.module.css';

export default function ShippingStep() {
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
                <Link to="/profile" className={clsx(sharedStyles.btn, sharedStyles.btnPrimary)}>
                    Ir a mis direcciones
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h2 className={sharedStyles.stepTitle}>Dirección de envío</h2>
            <p className={sharedStyles.stepSubtitle}>Selecciona dónde quieres recibir tu pedido</p>

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
                            />
                            <div className={styles.cardBody}>
                                <div className={styles.cardHeader}>
                                    <strong>{dir.alias}</strong>
                                    {dir.principal && (
                                        <span className={styles.badge}>Principal</span>
                                    )}
                                </div>
                                <p>{dir.direccion}</p>
                                <p>{dir.ciudad}, {dir.estado} {dir.codigoPostal}</p>
                                <p>{dir.pais} · {dir.telefono}</p>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            <div className={sharedStyles.field}>
                <label htmlFor="notas">Notas para el pedido (opcional)</label>
                <textarea
                    id="notas"
                    rows={3}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Instrucciones de entrega, horario preferido…"
                    maxLength={500}
                />
            </div>

            <ShippingPaymentSelector />

            <ShippingServiceSelector />

            <Link to="/profile" className={styles.link}>
                Gestionar direcciones en mi perfil
            </Link>
        </div>
    );
}
