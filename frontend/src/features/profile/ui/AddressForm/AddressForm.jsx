import { useState, useEffect } from 'react';
import './AddressForm.css';

const EMPTY = {
    alias: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: '',
    telefono: '',
    referencias: '',
    principal: false,
};

export default function AddressForm({ initialData, onSubmit, onCancel, saving }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState(null);

    const isEditing = Boolean(initialData?.id);

    useEffect(() => {
        if (initialData) {
            setForm({
                alias: initialData.alias || '',
                direccion: initialData.direccion || '',
                ciudad: initialData.ciudad || '',
                estado: initialData.estado || '',
                codigoPostal: initialData.codigoPostal || '',
                pais: initialData.pais || '',
                telefono: initialData.telefono || '',
                referencias: initialData.referencias || '',
                principal: initialData.principal || false,
            });
        } else {
            setForm(EMPTY);
        }
        setError(null);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await onSubmit(form);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <form className="address-form" onSubmit={handleSubmit}>
            <h3 className="address-form__title">
                {isEditing ? 'Editar dirección' : 'Nueva dirección'}
            </h3>

            {error && <p className="address-form__error" role="alert">{error}</p>}

            <div className="address-form__row">
                <div className="profile-field">
                    <label htmlFor="alias">Alias</label>
                    <input id="alias" name="alias" type="text" placeholder="Casa, Oficina…" value={form.alias} onChange={handleChange} required />
                </div>
                <div className="profile-field">
                    <label htmlFor="telefono">Teléfono</label>
                    <input id="telefono" name="telefono" type="tel" placeholder="+521234567890" value={form.telefono} onChange={handleChange} required />
                </div>
            </div>

            <div className="profile-field">
                <label htmlFor="direccion">Calle y número</label>
                <input id="direccion" name="direccion" type="text" value={form.direccion} onChange={handleChange} required />
            </div>

            <div className="address-form__row">
                <div className="profile-field">
                    <label htmlFor="ciudad">Ciudad</label>
                    <input id="ciudad" name="ciudad" type="text" value={form.ciudad} onChange={handleChange} required />
                </div>
                <div className="profile-field">
                    <label htmlFor="estado">Estado</label>
                    <input id="estado" name="estado" type="text" value={form.estado} onChange={handleChange} required />
                </div>
            </div>

            <div className="address-form__row">
                <div className="profile-field">
                    <label htmlFor="codigoPostal">Código postal</label>
                    <input id="codigoPostal" name="codigoPostal" type="text" value={form.codigoPostal} onChange={handleChange} />
                </div>
                <div className="profile-field">
                    <label htmlFor="pais">País</label>
                    <input id="pais" name="pais" type="text" value={form.pais} onChange={handleChange} required />
                </div>
            </div>

            <div className="profile-field">
                <label htmlFor="referencias">Referencias (opcional)</label>
                <textarea id="referencias" name="referencias" rows={2} value={form.referencias} onChange={handleChange} placeholder="Entre calles, color de fachada…" />
            </div>

            {!isEditing && (
                <label className="address-form__checkbox">
                    <input type="checkbox" name="principal" checked={form.principal} onChange={handleChange} />
                    Establecer como dirección principal
                </label>
            )}

            <div className="address-form__actions">
                <button type="submit" className="profile-btn profile-btn--primary" disabled={saving}>
                    {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar dirección'}
                </button>
                <button type="button" className="profile-btn profile-btn--secondary" onClick={onCancel} disabled={saving}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}
