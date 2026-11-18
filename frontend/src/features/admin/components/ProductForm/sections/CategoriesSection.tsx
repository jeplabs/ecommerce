import type { ChangeEvent } from 'react';
import type { CategoryTreeNode } from '@/features/catalog';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ProductFormData, AdditionalCategoryGroup } from '../types';
import styles from '../ProductForm.module.css';

interface CategoriesSectionProps {
    formData: ProductFormData;
    arbolCategorias: CategoryTreeNode[];
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    onAddAdditional: () => void;
}

export function findNodeById(id: string | number, tree: CategoryTreeNode[]): CategoryTreeNode | null {
    for (const node of tree) {
        if (node.id == id) return node;
        if (node.subcategorias) {
            const found = findNodeById(id, node.subcategorias);
            if (found) return found;
        }
    }
    return null;
}

export function CategoriesSection({
    formData,
    arbolCategorias,
    onChange,
    onAddAdditional,
}: CategoriesSectionProps) {
    return (
        <>
            <FormField label="Categoria" htmlFor="categoria">
                <Select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={onChange}
                    required
                >
                    <option value="">Selecciona una categoría</option>
                    {arbolCategorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                            {categoria.nombre}
                        </option>
                    ))}
                </Select>
            </FormField>

            <FormField label="Subcategoria" htmlFor="subcategoria">
                <Select
                    id="subcategoria"
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={onChange}
                    required
                    disabled={!formData.categoria}
                >
                    <option value="">Selecciona una subcategoría</option>
                    {arbolCategorias
                        .find((cat) => String(cat.id) === formData.categoria)
                        ?.subcategorias
                        .map((subcategoria) => (
                            <option key={subcategoria.id} value={subcategoria.id}>
                                {subcategoria.nombre}
                            </option>
                        ))}
                </Select>
            </FormField>

            <FormField label="Subsubcategoria" htmlFor="subsubcategoria">
                <Select
                    id="subsubcategoria"
                    name="subsubcategoria"
                    value={formData.subsubcategoria}
                    onChange={onChange}
                    disabled={!formData.subcategoria}
                >
                    <option value="">Selecciona una subcategoría</option>
                    {arbolCategorias
                        .find((cat) => String(cat.id) === formData.categoria)
                        ?.subcategorias
                        .find((subcat) => String(subcat.id) === formData.subcategoria)
                        ?.subcategorias
                        .map((subsubcategoria) => (
                            <option key={subsubcategoria.id} value={subsubcategoria.id}>
                                {subsubcategoria.nombre}
                            </option>
                        ))}
                </Select>
            </FormField>

            <FormField label="(Opcional)">
                <Button
                    type="button"
                    variant="primary"
                    onClick={onAddAdditional}
                    style={{ marginTop: '6px' }}
                >
                    Agregar categoría
                </Button>
            </FormField>
        </>
    );
}

export function AdditionalCategoriesList({
    additionalCategories,
    arbolCategorias,
    onUpdateAdditional,
    onRemoveAdditional,
}: {
    additionalCategories: AdditionalCategoryGroup[];
    arbolCategorias: CategoryTreeNode[];
    onUpdateAdditional: (
        id: string,
        field: 'categoria' | 'subcategoria' | 'subsubcategoria',
        value: string
    ) => void;
    onRemoveAdditional: (id: string) => void;
}) {
    if (additionalCategories.length === 0) return null;

    return (
        <>
            {additionalCategories.map((group) => {
                const catNode = findNodeById(group.categoria, arbolCategorias);
                const subCatNode = group.subcategoria ? findNodeById(group.subcategoria, arbolCategorias) : null;

                return (
                    <div key={group.id} className={styles.formRow}>
                        <FormField label="Categoria Adicional">
                            <Select
                                value={group.categoria}
                                onChange={(e) => onUpdateAdditional(group.id, 'categoria', e.target.value)}
                            >
                                <option value="">Selecciona una categoría</option>
                                {arbolCategorias.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Subcategoria">
                            <Select
                                value={group.subcategoria}
                                onChange={(e) => onUpdateAdditional(group.id, 'subcategoria', e.target.value)}
                                disabled={!group.categoria}
                            >
                                <option value="">Selecciona una subcategoría</option>
                                {catNode?.subcategorias?.map((sub) => (
                                    <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Subsubcategoria">
                            <Select
                                value={group.subsubcategoria}
                                onChange={(e) => onUpdateAdditional(group.id, 'subsubcategoria', e.target.value)}
                                disabled={!group.subcategoria}
                            >
                                <option value="">Selecciona una subcategoría</option>
                                {subCatNode?.subcategorias?.map((subsub) => (
                                    <option key={subsub.id} value={subsub.id}>{subsub.nombre}</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Remover">
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => onRemoveAdditional(group.id)}
                                title="Eliminar categoría"
                                style={{ marginTop: '6px' }}
                            >
                                Eliminar
                            </Button>
                        </FormField>
                    </div>
                );
            })}
        </>
    );
}
