import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BranchApi } from '@/entities/branch';
import { branchFormSchema, type BranchFormValues, type CreateBranchRequest } from '@/entities/branch';
import { Button } from '@/shared/ui/Button';
import { FormField, FieldError } from '@/shared/ui/FormField';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import styles from './BranchModalForm.module.css';

interface BranchModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    branchToEdit?: BranchApi | null;
    onSave: (values: CreateBranchRequest) => Promise<boolean>;
    isSaving?: boolean;
}

const DEFAULT_VALUES: BranchFormValues = {
    nombre: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'GT',
    telefono: '',
    horario: '',
    referencias: '',
    mapaUrl: '',
    ordenVisualizacion: undefined,
};

export default function BranchModalForm({
    isOpen,
    onClose,
    branchToEdit,
    onSave,
    isSaving = false,
}: BranchModalFormProps) {
    const isEditing = Boolean(branchToEdit);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BranchFormValues>({
        resolver: zodResolver(branchFormSchema),
        defaultValues: DEFAULT_VALUES,
    });

    useEffect(() => {
        if (!isOpen) return;

        if (branchToEdit) {
            reset({
                nombre: branchToEdit.nombre,
                direccion: branchToEdit.direccion,
                ciudad: branchToEdit.ciudad,
                estado: branchToEdit.estado ?? '',
                codigoPostal: branchToEdit.codigoPostal ?? '',
                pais: branchToEdit.pais,
                telefono: branchToEdit.telefono,
                horario: branchToEdit.horario,
                referencias: branchToEdit.referencias ?? '',
                mapaUrl: branchToEdit.mapaUrl ?? '',
                ordenVisualizacion: branchToEdit.ordenVisualizacion ?? undefined,
            });
        } else {
            reset(DEFAULT_VALUES);
        }
    }, [isOpen, branchToEdit, reset]);

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
            estado: data.estado?.trim() || null,
            codigoPostal: data.codigoPostal?.trim() || null,
            pais: data.pais.trim(),
            telefono: data.telefono.trim(),
            horario: data.horario.trim(),
            referencias: data.referencias?.trim() || null,
            mapaUrl: data.mapaUrl?.trim() || null,
            ordenVisualizacion: data.ordenVisualizacion ?? null,
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
                                        placeholder="Ej. Av. Principal 123, Zona 1"
                                        disabled={isSaving}
                                        {...register('direccion')}
                                    />
                                    {errors.direccion && <FieldError>{errors.direccion.message}</FieldError>}
                                </FormField>
                            </div>

                            <FormField label="Ciudad" htmlFor="branch-ciudad">
                                <Input
                                    id="branch-ciudad"
                                    placeholder="Ej. Ciudad de Guatemala"
                                    disabled={isSaving}
                                    {...register('ciudad')}
                                />
                                {errors.ciudad && <FieldError>{errors.ciudad.message}</FieldError>}
                            </FormField>

                            <FormField label="Estado / Depto." htmlFor="branch-estado">
                                <Input
                                    id="branch-estado"
                                    placeholder="Ej. Guatemala"
                                    disabled={isSaving}
                                    {...register('estado')}
                                />
                                {errors.estado && <FieldError>{errors.estado.message}</FieldError>}
                            </FormField>

                            <FormField label="Código Postal" htmlFor="branch-cp">
                                <Input
                                    id="branch-cp"
                                    placeholder="Ej. 01001"
                                    disabled={isSaving}
                                    {...register('codigoPostal')}
                                />
                                {errors.codigoPostal && <FieldError>{errors.codigoPostal.message}</FieldError>}
                            </FormField>

                            <FormField label="País" htmlFor="branch-pais">
                                <Input
                                    id="branch-pais"
                                    placeholder="GT"
                                    disabled={isSaving}
                                    {...register('pais')}
                                />
                                {errors.pais && <FieldError>{errors.pais.message}</FieldError>}
                            </FormField>

                            <FormField label="Teléfono de contacto" htmlFor="branch-telefono">
                                <Input
                                    id="branch-telefono"
                                    placeholder="Ej. +502 2345-6789"
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
                                    {...register('ordenVisualizacion')}
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
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
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

