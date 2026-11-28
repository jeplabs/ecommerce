import { useState, useEffect, useMemo, type FormEvent } from 'react';
import type { CategoryApi, CreateCategoryRequest } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import { FormField, FieldError } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import styles from './CategoryModalForm.module.css';

export interface CategoryModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit?: CategoryApi | null;
    defaultParentId?: number | null;
    allCategories: CategoryApi[];
    onSave: (payload: CreateCategoryRequest) => Promise<boolean>;
    isSaving?: boolean;
}

/** Profundidad máxima de jerarquía en backend (Raíz = 1 .. Nivel 5). */
export const MAX_CATEGORY_LEVELS = 5;

export function generarSlugPreview(nombre: string): string {
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getDescendantIds(node: CategoryApi): Set<number> {
    const ids = new Set<number>();
    ids.add(node.id);
    if (node.subcategorias && node.subcategorias.length > 0) {
        for (const child of node.subcategorias) {
            const childIds = getDescendantIds(child);
            childIds.forEach((id) => ids.add(id));
        }
    }
    return ids;
}

function getSubtreeHeight(node: CategoryApi): number {
    if (!node.subcategorias || node.subcategorias.length === 0) {
        return 1;
    }
    let maxChild = 0;
    for (const child of node.subcategorias) {
        maxChild = Math.max(maxChild, getSubtreeHeight(child));
    }
    return 1 + maxChild;
}

type ParentOption = {
    id: number;
    label: string;
    disabled: boolean;
};

export function CategoryModalForm({
    isOpen,
    onClose,
    categoryToEdit,
    defaultParentId,
    allCategories,
    onSave,
    isSaving = false,
}: CategoryModalFormProps) {
    const isEditing = Boolean(categoryToEdit);
    const [nombre, setNombre] = useState('');
    const [parentId, setParentId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Inicializar o resetear el formulario cuando se abre o cambia el objetivo
    useEffect(() => {
        if (!isOpen) {
            setNombre('');
            setParentId('');
            setError(null);
            return;
        }

        if (categoryToEdit) {
            setNombre(categoryToEdit.nombre);
            setParentId(categoryToEdit.parentId ? String(categoryToEdit.parentId) : '');
        } else if (defaultParentId) {
            setNombre('');
            setParentId(String(defaultParentId));
        } else {
            setNombre('');
            setParentId('');
        }
        setError(null);
    }, [isOpen, categoryToEdit, defaultParentId]);

    // Opciones elegibles como padre (excluyendo a la propia categoría y a sus descendientes en modo edición,
    // y deshabilitando aquellas que superarían la profundidad máxima de 5 niveles)
    const eligibleParentOptions = useMemo<ParentOption[]>(() => {
        const excludedIds = categoryToEdit ? getDescendantIds(categoryToEdit) : new Set<number>();
        const subtreeHeight = categoryToEdit ? getSubtreeHeight(categoryToEdit) : 1;
        const options: ParentOption[] = [];

        function flattenOptions(nodes: CategoryApi[], prefix = '', depthFromRoot = 1) {
            for (const node of nodes) {
                if (excludedIds.has(node.id)) continue;
                const exceedsMaxDepth = depthFromRoot + subtreeHeight > MAX_CATEGORY_LEVELS;
                options.push({
                    id: node.id,
                    label: `${prefix}${node.nombre}`,
                    disabled: exceedsMaxDepth,
                });
                if (node.subcategorias?.length > 0) {
                    flattenOptions(node.subcategorias, `${prefix}${node.nombre} > `, depthFromRoot + 1);
                }
            }
        }

        flattenOptions(allCategories);
        return options;
    }, [allCategories, categoryToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const trimmed = nombre.trim();
        if (trimmed.length < 2) {
            setError('El nombre debe tener al menos 2 caracteres.');
            return;
        }

        if (!generarSlugPreview(trimmed)) {
            setError('El nombre debe contener al menos un carácter alfanumérico.');
            return;
        }

        const payload: CreateCategoryRequest = {
            nombre: trimmed,
            parentId: parentId ? Number(parentId) : null,
        };

        const success = await onSave(payload);
        if (success) {
            onClose();
        }
    };

    const slugPreview = generarSlugPreview(nombre);

    return (
        <div
            className={styles.overlay}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-modal-title"
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 id="cat-modal-title">{isEditing ? 'Editar categoría' : 'Nueva categoría'}</h2>
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
                        <FormField label="Nombre de la categoría" htmlFor="cat-nombre">
                            <Input
                                id="cat-nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej. Laptops Gamer"
                                autoFocus
                                required
                            />
                        </FormField>

                        {slugPreview && (
                            <div className={styles.slugPreview}>
                                Slug generado: <code>{slugPreview}</code>
                            </div>
                        )}

                        <FormField label="Categoría padre (opcional)" htmlFor="cat-parent">
                            <Select
                                id="cat-parent"
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                            >
                                <option value="">-- Ninguno (Categoría Raíz) --</option>
                                {eligibleParentOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id} disabled={opt.disabled}>
                                        {opt.label}{opt.disabled ? ' (Límite 5 niveles)' : ''}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

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
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
