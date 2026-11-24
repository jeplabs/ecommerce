import { useState, useMemo } from 'react';
import { useCategorias, useToast } from '@/app/providers';
import type { CategoryApi, CreateCategoryRequest } from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import { AdminCategoriesTable } from '../AdminCategoriesTable/AdminCategoriesTable';
import { CategoryModalForm } from '../CategoryModalForm/CategoryModalForm';
import { DeleteCategoryModal } from '../DeleteCategoryModal/DeleteCategoryModal';
import styles from './AdminCategoriesView.module.css';

function countTotalCategories(nodes: CategoryApi[]): number {
    let count = 0;
    for (const node of nodes) {
        count += 1;
        if (node.subcategorias && node.subcategorias.length > 0) {
            count += countTotalCategories(node.subcategorias);
        }
    }
    return count;
}

export function AdminCategoriesView() {
    const {
        arbolCategorias,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategorias();

    const { showSuccess, showError } = useToast();

    const [searchFilter, setSearchFilter] = useState('');

    // Modal de Creación / Edición
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<CategoryApi | null>(null);
    const [defaultParentId, setDefaultParentId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal de Eliminación
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryApi | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Métricas calculadas
    const totalCount = useMemo(() => countTotalCategories(arbolCategorias), [arbolCategorias]);
    const rootCount = arbolCategorias.length;
    const subCount = totalCount - rootCount;

    // Handlers para abrir modales
    const handleOpenCreateRoot = () => {
        setCategoryToEdit(null);
        setDefaultParentId(null);
        setIsFormOpen(true);
    };

    const handleOpenAddSubcategory = (parent: CategoryApi) => {
        setCategoryToEdit(null);
        setDefaultParentId(parent.id);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (category: CategoryApi) => {
        setCategoryToEdit(category);
        setDefaultParentId(category.parentId ?? null);
        setIsFormOpen(true);
    };

    const handleOpenDelete = (category: CategoryApi) => {
        setCategoryToDelete(category);
        setIsDeleteOpen(true);
    };

    // Guardar (Crear o Actualizar)
    const handleSave = async (payload: CreateCategoryRequest): Promise<boolean> => {
        setIsSaving(true);
        try {
            if (categoryToEdit) {
                await updateCategory(categoryToEdit.id, payload);
                showSuccess(`Categoría "${payload.nombre}" actualizada con éxito.`);
            } else {
                await createCategory(payload);
                showSuccess(`Categoría "${payload.nombre}" creada con éxito.`);
            }
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al guardar categoría';
            showError(message);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    // Eliminar
    const handleDeleteConfirm = async (category: CategoryApi): Promise<boolean> => {
        setIsDeleting(true);
        try {
            await deleteCategory(category.id);
            showSuccess(`Categoría "${category.nombre}" eliminada.`);
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo eliminar la categoría';
            showError(message);
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Gestión de Categorías</h1>
                    <p className={styles.lead}>
                        Administra la jerarquía, ramas de productos y estructura del catálogo.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleOpenCreateRoot}
                    >
                        + Nueva Categoría Raíz
                    </Button>
                </div>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.statsBar}>
                    <span className={styles.statItem}>Total: <strong>{totalCount}</strong></span>
                    <span className={styles.statItem}>Raíces: <strong>{rootCount}</strong></span>
                    <span className={styles.statItem}>Subcategorías: <strong>{subCount}</strong></span>
                </div>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o slug..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {loading && arbolCategorias.length === 0 ? (
                <div className={styles.loadingBox}>
                    <p>Cargando estructura del catálogo...</p>
                </div>
            ) : (
                <AdminCategoriesTable
                    categories={arbolCategorias}
                    searchFilter={searchFilter}
                    onAddSubcategory={handleOpenAddSubcategory}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                />
            )}

            <CategoryModalForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                categoryToEdit={categoryToEdit}
                defaultParentId={defaultParentId}
                allCategories={arbolCategorias}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <DeleteCategoryModal
                isOpen={isDeleteOpen}
                category={categoryToDelete}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default AdminCategoriesView;
