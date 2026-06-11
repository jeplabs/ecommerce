import { useProfile, useToast } from '@/app/providers';
import { useState } from 'react';
import clsx from 'clsx';

import {
    mapAddressFormToCreateRequest,
    mapAddressFormToUpdateRequest,
} from '@/entities/address';
import type { AddressApi } from '@/entities/address';
import type { AddressFormValues } from '@/entities/address';
import AddressForm from '../AddressForm/AddressForm';
import { Button } from '@/shared/ui/Button';
import styles from './AddressesTab.module.css';

export default function AddressesTab() {
    const { direcciones } = useProfile();
    const { showSuccess, showError } = useToast();

    const {
        direcciones: lista,
        loading,
        saving,
        error,
        crearDireccion,
        actualizarDireccion,
        cambiarPrincipal,
        eliminarDireccion,
    } = direcciones;

    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressApi | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const handleCreate = async (form: AddressFormValues) => {
        const result = await crearDireccion(mapAddressFormToCreateRequest(form));
        if (result.success) {
            showSuccess('Dirección agregada');
            setShowForm(false);
        }
        return result;
    };

    const handleUpdate = async (form: AddressFormValues) => {
        if (!editingAddress) {
            return { success: false as const, error: 'Dirección no seleccionada' };
        }
        const result = await actualizarDireccion(
            editingAddress.id,
            mapAddressFormToUpdateRequest(form)
        );
        if (result.success) {
            showSuccess('Dirección actualizada');
            setEditingAddress(null);
        }
        return result;
    };

    const handleSetPrincipal = async (id: number) => {
        const result = await cambiarPrincipal(id);
        if (result.success) {
            showSuccess('Dirección principal actualizada');
        } else {
            showError(result.error);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await eliminarDireccion(id);
        if (result.success) {
            showSuccess('Dirección eliminada');
            setConfirmDelete(null);
        } else {
            showError(result.error);
        }
    };

    const activeDirecciones = lista.filter((d) => d.activo !== false);

    return (
        <section className={styles.root} aria-label="Direcciones de envío">
            <div className={styles.header}>
                <div>
                    <h2>Mis direcciones</h2>
                    <p>Gestiona tus direcciones de envío</p>
                </div>
                {!showForm && !editingAddress && (
                    <Button
                        type="button"
                        variant="primary"
                        className={styles.addBtn}
                        onClick={() => setShowForm(true)}
                    >
                        + Nueva dirección
                    </Button>
                )}
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            {showForm && (
                <AddressForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                    saving={saving}
                />
            )}

            {editingAddress && (
                <AddressForm
                    initialData={editingAddress}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingAddress(null)}
                    saving={saving}
                />
            )}

            {loading ? (
                <p className={styles.loading}>Cargando direcciones…</p>
            ) : activeDirecciones.length === 0 && !showForm ? (
                <div className={styles.empty}>
                    <p>No tienes direcciones guardadas.</p>
                    <Button type="button" variant="primary" onClick={() => setShowForm(true)}>
                        Agregar primera dirección
                    </Button>
                </div>
            ) : (
                <ul className={styles.list}>
                    {activeDirecciones.map((dir) => (
                        <li key={dir.id} className={clsx(styles.card, dir.principal && styles.cardPrincipal)}>
                            <div className={styles.cardHeader}>
                                <span className={styles.alias}>{dir.alias}</span>
                                {dir.principal && (
                                    <span className={styles.badge}>Principal</span>
                                )}
                            </div>
                            <p className={styles.line}>{dir.direccion}</p>
                            <p className={styles.line}>
                                {dir.ciudad}, {dir.estado} {dir.codigoPostal}
                            </p>
                            <p className={styles.line}>{dir.pais}</p>
                            <p className={clsx(styles.line, styles.phone)}>📞 {dir.telefono}</p>
                            <br></br>
                            <h4>Referencias</h4>
                            {dir.referencias && dir.referencias.length > 0 ? (
                                <p className={styles.refs}>{dir.referencias}</p>
                            ) : (
                                <p className={styles.refs}>No hay referencias guardadas.</p>
                            )}

                            <div className={styles.cardActions}>
                                {!dir.principal && (
                                    <button
                                        type="button"
                                        className={styles.action}
                                        onClick={() => handleSetPrincipal(dir.id)}
                                        disabled={saving}
                                    >
                                        Hacer principal
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={styles.action}
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingAddress(dir);
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    className={clsx(styles.action, styles.actionDanger)}
                                    onClick={() => setConfirmDelete(dir.id)}
                                >
                                    Eliminar
                                </button>
                            </div>

                            {confirmDelete === dir.id && (
                                <div className={styles.confirm}>
                                    <p>¿Eliminar esta dirección?</p>
                                    <div className={styles.confirmActions}>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setConfirmDelete(null)}
                                        >
                                            No
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={() => handleDelete(dir.id)}
                                            disabled={saving}
                                        >
                                            Sí, eliminar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
