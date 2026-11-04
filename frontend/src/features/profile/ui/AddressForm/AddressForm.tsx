import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from 'react';
import type { AddressApi } from '@/entities/address';
import type { AddressFormValues } from '@/entities/address';
import type { AddressActionResult } from '@/entities/address';
import { useConfig } from '@/app/providers';
import { getTerritoryConfig } from '@/shared/config/territories';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
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
    const { paisCodigo, paisNombre } = useConfig();
    const territory = useMemo(() => {
        return getTerritoryConfig(initialData?.pais || paisCodigo);
    }, [initialData?.pais, paisCodigo]);

    const [form, setForm] = useState<AddressFormValues>(() => ({
        ...EMPTY,
        pais: initialData?.pais || territory.name || paisNombre,
    }));
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
                pais: initialData.pais || territory.name,
                telefono: initialData.telefono || '',
                referencias: initialData.referencias || '',
                principal: initialData.principal || false,
            });
        } else {
            setForm({
                ...EMPTY,
                pais: territory.name,
            });
        }
        setError(null);
    }, [initialData, territory.name]);

    const divisionOptions = useMemo(() => {
        return Object.keys(territory.divisions);
    }, [territory.divisions]);

    const subdivisionOptions = useMemo(() => {
        if (!form.estado) return [];
        return territory.divisions[form.estado] || [];
    }, [territory.divisions, form.estado]);

    const isCustomDivision = Boolean(form.estado && !divisionOptions.includes(form.estado));
    const isCustomSubdivision = Boolean(form.ciudad && subdivisionOptions.length > 0 && !subdivisionOptions.includes(form.ciudad));

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleDivisionChange = (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const nextDivision = e.target.value;
        setForm((prev) => {
            const nextSubdivisions = territory.divisions[nextDivision] || [];
            // Si la ciudad/comuna actual no pertenece al nuevo departamento/región, resetearla
            const keepCity = nextSubdivisions.includes(prev.ciudad);
            return {
                ...prev,
                estado: nextDivision,
                ciudad: keepCity ? prev.ciudad : '',
            };
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const payload: AddressFormValues = {
            ...form,
            pais: form.pais.trim() || territory.name,
        };

        const result = await onSubmit(payload);
        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className={styles.shell}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h3 className={styles.title}>
                    {isEditing ? 'Editar dirección' : 'Nueva dirección'}
                </h3>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <div className={styles.row}>
                    <FormField label="Alias" htmlFor="alias" className={styles.field}>
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
                    <FormField label={territory.labels.phone} htmlFor="telefono" className={styles.field}>
                        <Input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            placeholder={territory.placeholders.phone}
                            value={form.telefono}
                            onChange={handleChange}
                            required
                        />
                    </FormField>
                </div>

                <FormField label={territory.labels.address} htmlFor="direccion" className={styles.field}>
                    <Input
                        id="direccion"
                        name="direccion"
                        type="text"
                        placeholder={territory.placeholders.address}
                        value={form.direccion}
                        onChange={handleChange}
                        required
                    />
                </FormField>

                <div className={styles.row}>
                    <FormField label={territory.labels.divisionLevel1} htmlFor="estado" className={styles.field}>
                        {divisionOptions.length > 0 && !isCustomDivision ? (
                            <Select
                                id="estado"
                                name="estado"
                                value={form.estado}
                                onChange={handleDivisionChange}
                                required
                            >
                                <option value="" disabled>
                                    {territory.placeholders.divisionLevel1}
                                </option>
                                {divisionOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </Select>
                        ) : (
                            <Input
                                id="estado"
                                name="estado"
                                type="text"
                                placeholder={territory.placeholders.divisionLevel1}
                                value={form.estado}
                                onChange={handleDivisionChange}
                                required
                            />
                        )}
                    </FormField>

                    <FormField label={territory.labels.divisionLevel2} htmlFor="ciudad" className={styles.field}>
                        {subdivisionOptions.length > 0 && !isCustomSubdivision ? (
                            <Select
                                id="ciudad"
                                name="ciudad"
                                value={form.ciudad}
                                onChange={handleChange}
                                disabled={!form.estado}
                                required
                            >
                                <option value="" disabled>
                                    {form.estado
                                        ? territory.placeholders.divisionLevel2
                                        : `Primero selecciona ${territory.labels.divisionLevel1.toLowerCase()}`}
                                </option>
                                {subdivisionOptions.map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </Select>
                        ) : (
                            <Input
                                id="ciudad"
                                name="ciudad"
                                type="text"
                                placeholder={territory.placeholders.divisionLevel2}
                                value={form.ciudad}
                                onChange={handleChange}
                                required
                            />
                        )}
                    </FormField>
                </div>

                <div className={styles.row}>
                    <FormField label={territory.labels.postalCode} htmlFor="codigoPostal" className={styles.field}>
                        <Input
                            id="codigoPostal"
                            name="codigoPostal"
                            type="text"
                            placeholder={territory.placeholders.postalCode}
                            value={form.codigoPostal}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="País" htmlFor="pais" className={styles.field}>
                        <Input
                            id="pais"
                            name="pais"
                            type="text"
                            value={form.pais || territory.name}
                            readOnly
                            disabled
                        />
                    </FormField>
                </div>

                <FormField label={territory.labels.references} htmlFor="referencias" className={styles.field}>
                    <Textarea
                        id="referencias"
                        name="referencias"
                        rows={2}
                        value={form.referencias}
                        onChange={handleChange}
                        placeholder={territory.placeholders.references}
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
        </div>
    );
}
