import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { AddressApi } from '@/entities/address';
import type { AddressFormValues } from '@/entities/address';
import type { AddressActionResult } from '@/entities/address';
import { Button } from '@/shared/ui/Button';
import './AddressForm.css';

const EMPTY: AddressFormValues = {
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

type AddressFormProps = {
    initialData?: AddressApi | null;
    onSubmit: (form: AddressFormValues) => Promise<AddressActionResult<unknown>>;
    onCancel: () => void;
    saving: boolean;
};

export default function AddressForm({ initialData, onSubmit, onCancel, saving }: AddressFormProps) {
    const [form, setForm] = useState<AddressFormValues>(EMPTY);
    const [error, setError] = useState<string | null>(null);

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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
                <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Agregar dirección'}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
