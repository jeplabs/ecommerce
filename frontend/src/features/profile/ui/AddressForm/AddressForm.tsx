import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import type { AddressApi } from '@/entities/address';
import type { AddressFormValues } from '@/entities/address';
import type { AddressActionResult } from '@/entities/address';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import styles from './AddressForm.module.css';

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
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.title}>
                {isEditing ? 'Editar dirección' : 'Nueva dirección'}
            </h3>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <div className={styles.row}>
                <FormField label="Alias" htmlFor="alias">
                    <Input
                        id="alias"
                        name="alias"
                        type="text"
                        placeholder="Casa, Oficina…"
                        value={form.alias}
                        onChange={handleChange}
                        required
                    />
                </FormField>
                <FormField label="Teléfono" htmlFor="telefono">
                    <Input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        placeholder="+521234567890"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                    />
                </FormField>
            </div>

            <FormField label="Calle y número" htmlFor="direccion">
                <Input
                    id="direccion"
                    name="direccion"
                    type="text"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                />
            </FormField>

            <div className={styles.row}>
                <FormField label="Ciudad" htmlFor="ciudad">
                    <Input
                        id="ciudad"
                        name="ciudad"
                        type="text"
                        value={form.ciudad}
                        onChange={handleChange}
                        required
                    />
                </FormField>
                <FormField label="Estado" htmlFor="estado">
                    <Input
                        id="estado"
                        name="estado"
                        type="text"
                        value={form.estado}
                        onChange={handleChange}
                        required
                    />
                </FormField>
            </div>

            <div className={styles.row}>
                <FormField label="Código postal" htmlFor="codigoPostal">
                    <Input
                        id="codigoPostal"
                        name="codigoPostal"
                        type="text"
                        value={form.codigoPostal}
                        onChange={handleChange}
                    />
                </FormField>
                <FormField label="País" htmlFor="pais">
                    <Input
                        id="pais"
                        name="pais"
                        type="text"
                        value={form.pais}
                        onChange={handleChange}
                        required
                    />
                </FormField>
            </div>

            <FormField label="Referencias (opcional)" htmlFor="referencias">
                <Textarea
                    id="referencias"
                    name="referencias"
                    rows={2}
                    value={form.referencias}
                    onChange={handleChange}
                    placeholder="Entre calles, color de fachada…"
                />
            </FormField>

            {!isEditing && (
                <label className={styles.checkbox}>
                    <input type="checkbox" name="principal" checked={form.principal} onChange={handleChange} />
                    Establecer como dirección principal
                </label>
            )}

            <div className={styles.actions}>
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
