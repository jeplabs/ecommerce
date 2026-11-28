import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
    normalizeSynonymTerm,
    type SaveSearchSynonymRequest,
    type SearchSynonymApi,
} from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import { FormField, FieldError } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import styles from './SynonymModalForm.module.css';

export interface SynonymModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    groupToEdit?: SearchSynonymApi | null;
    onSave: (payload: SaveSearchSynonymRequest) => Promise<boolean>;
    isSaving?: boolean;
}

export function extractNormalizedUniqueTerms(rawInput: string): string[] {
    const parts = rawInput.split(/[,\n]+/);
    const unique = new Set<string>();
    for (const part of parts) {
        const clean = normalizeSynonymTerm(part);
        if (clean.length >= 2) {
            unique.add(clean);
        }
    }
    return Array.from(unique);
}

export function SynonymModalForm({
    isOpen,
    onClose,
    groupToEdit = null,
    onSave,
    isSaving = false,
}: SynonymModalFormProps) {
    const isEditing = Boolean(groupToEdit);
    const [nombreGrupo, setNombreGrupo] = useState('');
    const [terminosInput, setTerminosInput] = useState('');
    const [activo, setActivo] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setNombreGrupo('');
            setTerminosInput('');
            setActivo(true);
            setError(null);
            return;
        }

        if (groupToEdit) {
            setNombreGrupo(groupToEdit.nombreGrupo);
            setTerminosInput(groupToEdit.terminos.join(', '));
            setActivo(groupToEdit.activo);
        } else {
            setNombreGrupo('');
            setTerminosInput('');
            setActivo(true);
        }
        setError(null);
    }, [isOpen, groupToEdit]);

    const normalizedPreview = useMemo(
        () => extractNormalizedUniqueTerms(terminosInput),
        [terminosInput]
    );

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const trimmedName = nombreGrupo.trim();
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            setError('El nombre del grupo debe tener entre 2 y 100 caracteres.');
            return;
        }

        if (normalizedPreview.length < 2) {
            setError(
                'Debes ingresar al menos 2 términos alfanuméricos distintos de mínimo 2 caracteres.'
            );
            return;
        }

        const joinedLength = normalizedPreview.join(',').length;
        if (joinedLength > 500) {
            setError('La lista de términos supera el límite máximo de 500 caracteres.');
            return;
        }

        const success = await onSave({
            nombreGrupo: trimmedName,
            terminos: normalizedPreview,
            activo,
        });

        if (success) {
            onClose();
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="synonym-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 id="synonym-modal-title">
                        {isEditing ? 'Editar grupo de sinónimos' : 'Nuevo grupo de sinónimos'}
                    </h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <FormField label="Nombre del grupo" htmlFor="syn-group-name">
                            <Input
                                id="syn-group-name"
                                value={nombreGrupo}
                                onChange={(e) => setNombreGrupo(e.target.value)}
                                placeholder="Ej. laptops, almacenamiento, audio"
                                autoFocus
                                required
                            />
                        </FormField>

                        <FormField
                            label="Términos equivalentes (separados por coma)"
                            htmlFor="syn-terms-input"
                        >
                            <Input
                                id="syn-terms-input"
                                value={terminosInput}
                                onChange={(e) => setTerminosInput(e.target.value)}
                                placeholder="Ej. laptop, notebook, portátil, ultrabook"
                                required
                            />
                        </FormField>

                        <div className={styles.previewBox}>
                            <span className={styles.previewLabel}>
                                Términos normalizados ({normalizedPreview.length}):
                            </span>
                            {normalizedPreview.length > 0 ? (
                                <div className={styles.previewChips}>
                                    {normalizedPreview.map((term) => (
                                        <span key={term} className={styles.chip}>
                                            {term}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className={styles.previewEmpty}>
                                    Escribe al menos 2 términos separados por coma.
                                </span>
                            )}
                        </div>

                        <label className={styles.checkboxRow} htmlFor="syn-active">
                            <input
                                id="syn-active"
                                type="checkbox"
                                checked={activo}
                                onChange={(e) => setActivo(e.target.checked)}
                            />
                            <span>Grupo activo en el motor de búsqueda del catálogo</span>
                        </label>

                        {error && <FieldError>{error}</FieldError>}
                    </div>

                    <div className={styles.footer}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSaving}>
                            {isSaving
                                ? 'Guardando...'
                                : isEditing
                                  ? 'Guardar cambios'
                                  : 'Crear grupo'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
