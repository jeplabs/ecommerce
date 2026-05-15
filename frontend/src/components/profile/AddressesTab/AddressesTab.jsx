import { useState } from 'react';
import { useProfile } from '../../../context/ProfileContext';
import { useToast } from '../../../context/ToastContext';
import AddressForm from '../AddressForm/AddressForm';
import './AddressesTab.css';

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
    const [editingAddress, setEditingAddress] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleCreate = async (form) => {
        const result = await crearDireccion(form);
        if (result.success) {
            showSuccess('Dirección agregada');
            setShowForm(false);
        }
        return result;
    };

    const handleUpdate = async (form) => {
        const { principal, ...datos } = form;
        const result = await actualizarDireccion(editingAddress.id, datos);
        if (result.success) {
            showSuccess('Dirección actualizada');
            setEditingAddress(null);
        }
        return result;
    };

    const handleSetPrincipal = async (id) => {
        const result = await cambiarPrincipal(id);
        if (result.success) {
            showSuccess('Dirección principal actualizada');
        } else {
            showError(result.error);
        }
    };

    const handleDelete = async (id) => {
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
        <section className="addresses-tab" aria-label="Direcciones de envío">
            <div className="addresses-tab__header">
                <div>
                    <h2>Mis direcciones</h2>
                    <p>Gestiona tus direcciones de envío</p>
                </div>
                {!showForm && !editingAddress && (
                    <button
                        type="button"
                        className="profile-btn profile-btn--primary addresses-tab__add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Nueva dirección
                    </button>
                )}
            </div>

            {error && <p className="addresses-tab__error" role="alert">{error}</p>}

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
                <p className="addresses-tab__loading">Cargando direcciones…</p>
            ) : activeDirecciones.length === 0 && !showForm ? (
                <div className="addresses-tab__empty">
                    <p>No tienes direcciones guardadas.</p>
                    <button
                        type="button"
                        className="profile-btn profile-btn--primary"
                        onClick={() => setShowForm(true)}
                    >
                        Agregar primera dirección
                    </button>
                </div>
            ) : (
                <ul className="addresses-list">
                    {activeDirecciones.map((dir) => (
                        <li key={dir.id} className={`address-card ${dir.principal ? 'address-card--principal' : ''}`}>
                            <div className="address-card__header">
                                <span className="address-card__alias">{dir.alias}</span>
                                {dir.principal && (
                                    <span className="address-card__badge">Principal</span>
                                )}
                            </div>
                            <p className="address-card__line">{dir.direccion}</p>
                            <p className="address-card__line">
                                {dir.ciudad}, {dir.estado} {dir.codigoPostal}
                            </p>
                            <p className="address-card__line">{dir.pais}</p>
                            <p className="address-card__line address-card__phone">📞 {dir.telefono}</p>
                            {dir.referencias && (
                                <p className="address-card__refs">{dir.referencias}</p>
                            )}

                            <div className="address-card__actions">
                                {!dir.principal && (
                                    <button
                                        type="button"
                                        className="address-card__action"
                                        onClick={() => handleSetPrincipal(dir.id)}
                                        disabled={saving}
                                    >
                                        Hacer principal
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="address-card__action"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingAddress(dir);
                                    }}
                                >
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    className="address-card__action address-card__action--danger"
                                    onClick={() => setConfirmDelete(dir.id)}
                                >
                                    Eliminar
                                </button>
                            </div>

                            {confirmDelete === dir.id && (
                                <div className="address-card__confirm">
                                    <p>¿Eliminar esta dirección?</p>
                                    <div className="address-card__confirm-actions">
                                        <button
                                            type="button"
                                            className="profile-btn profile-btn--secondary"
                                            onClick={() => setConfirmDelete(null)}
                                        >
                                            No
                                        </button>
                                        <button
                                            type="button"
                                            className="profile-btn profile-btn--primary"
                                            onClick={() => handleDelete(dir.id)}
                                            disabled={saving}
                                        >
                                            Sí, eliminar
                                        </button>
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
