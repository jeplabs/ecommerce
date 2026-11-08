import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfig } from '@/app/providers';
import { getTerritoryConfig } from '@/config/territories';
import {
    branchFormSchema,
    type BranchApi,
    type BranchFormValues,
    type CreateBranchRequest,
} from '../../types';
import { Button } from '@/components/ui/Button';
import { FormField, FieldError } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import styles from './BranchModalForm.module.css';

export interface BranchModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    branchToEdit?: BranchApi | null;
    onSave: (values: CreateBranchRequest) => Promise<boolean>;
    isSaving?: boolean;
}

export function BranchModalForm({
    isOpen,
    onClose,
    branchToEdit,
    onSave,
    isSaving = false,
}: BranchModalFormProps) {
    const isEditing = Boolean(branchToEdit);
    const { paisCodigo, paisNombre } = useConfig();

    const territory = useMemo(() => {
        return getTerritoryConfig(branchToEdit?.pais || paisCodigo);
    }, [branchToEdit?.pais, paisCodigo]);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<BranchFormValues>({
        resolver: zodResolver(branchFormSchema),
        defaultValues: {
            nombre: '',
            direccion: '',
            ciudad: '',
            estado: '',
            codigoPostal: '',
            pais: territory.name || paisNombre || 'Guatemala',
            telefono: '',
            horario: '',
            referencias: '',
            mapaUrl: '',
            ordenVisualizacion: '',
        },
    });

    const selectedEstado = watch('estado');
    const selectedCiudad = watch('ciudad');

    const divisionOptions = useMemo(() => {
        return Object.keys(territory.divisions);
    }, [territory.divisions]);

    const subdivisionOptions = useMemo(() => {
        if (!selectedEstado) return [];
        return territory.divisions[selectedEstado] || [];
    }, [territory.divisions, selectedEstado]);

    useEffect(() => {
        if (!isOpen) return;

        if (branchToEdit) {
            const editTerritory = getTerritoryConfig(branchToEdit.pais);
            reset({
                nombre: branchToEdit.nombre,
                direccion: branchToEdit.direccion,
                ciudad: branchToEdit.ciudad,
                estado: branchToEdit.estado ?? '',
                codigoPostal: branchToEdit.codigoPostal ?? '',
                pais: editTerritory.name || branchToEdit.pais,
                telefono: branchToEdit.telefono,
                horario: branchToEdit.horario,
                referencias: branchToEdit.referencias ?? '',
                mapaUrl: branchToEdit.mapaUrl ?? '',
                ordenVisualizacion:
                    branchToEdit.ordenVisualizacion !== null && branchToEdit.ordenVisualizacion !== undefined
                        ? branchToEdit.ordenVisualizacion
                        : '',
            });
        } else {
            reset({
                nombre: '',
                direccion: '',
                ciudad: '',
                estado: '',
                codigoPostal: '',
                pais: territory.name || paisNombre || 'Guatemala',
                telefono: '',
                horario: '',
                referencias: '',
                mapaUrl: '',
                ordenVisualizacion: '',
            });
        }
    }, [isOpen, branchToEdit, reset, territory.name, paisNombre]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const onSubmit = async (data: BranchFormValues) => {
        const payload: CreateBranchRequest = {
            nombre: data.nombre.trim(),
            direccion: data.direccion.trim(),
            ciudad: data.ciudad.trim(),
            estado: data.estado.trim(),
            codigoPostal: data.codigoPostal?.trim() || null,
            pais: territory.name,
            telefono: data.telefono.trim(),
            horario: data.horario.trim(),
            referencias: data.referencias?.trim() || null,
            mapaUrl: data.mapaUrl?.trim() || null,
            ordenVisualizacion:
                typeof data.ordenVisualizacion === 'number' && !isNaN(data.ordenVisualizacion)
                    ? data.ordenVisualizacion
                    : null,
        };

        const success = await onSave(payload);
        if (success) {
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h3 className={styles.title}>
                        {isEditing ? 'Editar sucursal' : 'Nueva sucursal de retiro'}
                    </h3>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </header>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.body}>
                        <div className={styles.formGrid}>
                            <div className={styles.fullWidth}>
                                <FormField label="Nombre de la sucursal" htmlFor="branch-nombre">
                                    <Input
                                        id="branch-nombre"
                                        placeholder="Ej. Tienda Centro"
                                        disabled={isSaving}
                                        {...register('nombre')}
                                    />
                                    {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
                                </FormField>
                            </div>

                            <div className={styles.fullWidth}>
                                <FormField label="Dirección física" htmlFor="branch-direccion">
                                    <Input
                                        id="branch-direccion"
                                        placeholder={territory.placeholders.address}
                                        disabled={isSaving}
                                        {...register('direccion')}
                                    />
                                    {errors.direccion && <FieldError>{errors.direccion.message}</FieldError>}
                                </FormField>
                            </div>

                            <FormField label={territory.labels.divisionLevel1} htmlFor="branch-estado">
                                <Select
                                    id="branch-estado"
                                    disabled={isSaving}
                                    {...register('estado', {
                                        onChange: (e) => {
                                            const nextSubdivisions = territory.divisions[e.target.value] || [];
                                            const currentCiudad = getValues('ciudad');
                                            if (!nextSubdivisions.includes(currentCiudad)) {
                                                setValue('ciudad', '', { shouldValidate: true });
                                            }
                                        },
                                    })}
                                >
                                    <option value="" disabled>
                                        {territory.placeholders.divisionLevel1}
                                    </option>
                                    {selectedEstado && !divisionOptions.includes(selectedEstado) && (
                                        <option value={selectedEstado}>{selectedEstado}</option>
                                    )}
                                    {divisionOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </Select>
                                {errors.estado && <FieldError>{errors.estado.message}</FieldError>}
                            </FormField>

                            <FormField label={territory.labels.divisionLevel2} htmlFor="branch-ciudad">
                                <Select
                                    id="branch-ciudad"
                                    disabled={isSaving || !selectedEstado}
                                    {...register('ciudad')}
                                >
                                    <option value="" disabled>
                                        {selectedEstado
                                            ? territory.placeholders.divisionLevel2
                                            : `Primero selecciona ${territory.labels.divisionLevel1.toLowerCase()}`}
                                    </option>
                                    {selectedCiudad && !subdivisionOptions.includes(selectedCiudad) && (
                                        <option value={selectedCiudad}>{selectedCiudad}</option>
                                    )}
                                    {subdivisionOptions.map((sub) => (
                                        <option key={sub} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </Select>
                                {errors.ciudad && <FieldError>{errors.ciudad.message}</FieldError>}
                            </FormField>

                            <FormField label={territory.labels.postalCode} htmlFor="branch-cp">
                                <Input
                                    id="branch-cp"
                                    placeholder={territory.placeholders.postalCode}
                                    disabled={isSaving}
                                    {...register('codigoPostal')}
                                />
                                {errors.codigoPostal && <FieldError>{errors.codigoPostal.message}</FieldError>}
                            </FormField>

                            <FormField label="País" htmlFor="branch-pais">
                                <Input
                                    id="branch-pais"
                                    type="text"
                                    value={territory.name}
                                    readOnly
                                    disabled
                                />
                                <input type="hidden" {...register('pais')} value={territory.name} />
                                {errors.pais && <FieldError>{errors.pais.message}</FieldError>}
                            </FormField>

                            <FormField label="Teléfono de contacto" htmlFor="branch-telefono">
                                <Input
                                    id="branch-telefono"
                                    placeholder={territory.placeholders.phone}
                                    disabled={isSaving}
                                    {...register('telefono')}
                                />
                                {errors.telefono && <FieldError>{errors.telefono.message}</FieldError>}
                            </FormField>

                            <FormField label="Orden de visualización" htmlFor="branch-orden">
                                <Input
                                    id="branch-orden"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    disabled={isSaving}
                                    {...register('ordenVisualizacion', {
                                        setValueAs: (v) =>
                                            v === '' || v === null || v === undefined ? '' : Number(v),
                                    })}
                                />
                                {errors.ordenVisualizacion && (
                                    <FieldError>{errors.ordenVisualizacion.message}</FieldError>
                                )}
                            </FormField>

                            <div className={styles.fullWidth}>
                                <FormField label="Horario de atención" htmlFor="branch-horario">
                                    <Input
                                        id="branch-horario"
                                        placeholder="Ej. Lun-Vie: 9:00-18:00, Sáb: 9:00-13:00"
                                        disabled={isSaving}
                                        {...register('horario')}
                                    />
                                    {errors.horario && <FieldError>{errors.horario.message}</FieldError>}
                                </FormField>
                            </div>

                            <div className={styles.fullWidth}>
                                <FormField label="Enlace Google Maps (opcional)" htmlFor="branch-mapa">
                                    <Input
                                        id="branch-mapa"
                                        type="url"
                                        placeholder="https://maps.google.com/?q=..."
                                        disabled={isSaving}
                                        {...register('mapaUrl')}
                                    />
                                    {errors.mapaUrl && <FieldError>{errors.mapaUrl.message}</FieldError>}
                                </FormField>
                            </div>

                            <div className={styles.fullWidth}>
                                <FormField label="Referencias de ubicación (opcional)" htmlFor="branch-refs">
                                    <Textarea
                                        id="branch-refs"
                                        rows={2}
                                        placeholder="Ej. Centro Comercial, local 105, frente a la fuente"
                                        disabled={isSaving}
                                        {...register('referencias')}
                                    />
                                    {errors.referencias && <FieldError>{errors.referencias.message}</FieldError>}
                                </FormField>
                            </div>
                        </div>
                    </div>

                    <footer className={styles.footer}>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSaving}>
                            {isSaving ? 'Guardando…' : isEditing ? 'Actualizar sucursal' : 'Crear sucursal'}
                        </Button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

export default BranchModalForm;
