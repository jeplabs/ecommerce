import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/app/providers';
import {
    searchSynonymsApi,
    type SaveSearchSynonymRequest,
    type SearchSynonymApi,
} from '@/features/catalog';
import { Button } from '@/components/ui/Button';
import { AdminSynonymsTable } from '../AdminSynonymsTable';
import { SynonymModalForm } from '../SynonymModalForm';
import styles from './AdminSynonymsView.module.css';

export function AdminSynonymsView() {
    const { showSuccess, showError } = useToast();

    const [groups, setGroups] = useState<SearchSynonymApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState('');

    // Modal de formulario
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [groupToEdit, setGroupToEdit] = useState<SearchSynonymApi | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal de confirmación de eliminación
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<SearchSynonymApi | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchSynonymsApi.getAll();
            setGroups(data);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Error al cargar los grupos de sinónimos';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchGroups();
    }, [fetchGroups]);

    const filteredGroups = useMemo(() => {
        const query = searchFilter.trim().toLowerCase();
        if (!query) return groups;
        return groups.filter(
            (g) =>
                g.nombreGrupo.toLowerCase().includes(query) ||
                g.terminos.some((t) => t.toLowerCase().includes(query))
        );
    }, [groups, searchFilter]);

    const stats = useMemo(() => {
        const total = groups.length;
        const activos = groups.filter((g) => g.activo).length;
        const pausados = total - activos;
        return { total, activos, pausados };
    }, [groups]);

    const handleOpenCreate = () => {
        setGroupToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (group: SearchSynonymApi) => {
        setGroupToEdit(group);
        setIsFormOpen(true);
    };

    const handleOpenDelete = (group: SearchSynonymApi) => {
        setGroupToDelete(group);
        setIsDeleteOpen(true);
    };

    const handleSave = async (payload: SaveSearchSynonymRequest): Promise<boolean> => {
        setIsSaving(true);
        try {
            if (groupToEdit) {
                const updated = await searchSynonymsApi.update(groupToEdit.id, payload);
                setGroups((prev) =>
                    prev
                        .map((g) => (g.id === updated.id ? updated : g))
                        .sort((a, b) => a.nombreGrupo.localeCompare(b.nombreGrupo))
                );
                showSuccess(`Grupo "${updated.nombreGrupo}" actualizado con éxito.`);
            } else {
                const created = await searchSynonymsApi.create(payload);
                setGroups((prev) =>
                    [...prev, created].sort((a, b) => a.nombreGrupo.localeCompare(b.nombreGrupo))
                );
                showSuccess(`Grupo "${created.nombreGrupo}" creado con éxito.`);
            }
            return true;
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo guardar el grupo de sinónimos';
            showError(message);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (group: SearchSynonymApi) => {
        try {
            const updated = await searchSynonymsApi.toggleStatus(group.id);
            setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
            showSuccess(
                `Grupo "${updated.nombreGrupo}" ${updated.activo ? 'activado' : 'pausado'}.`
            );
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo cambiar el estado del grupo';
            showError(message);
        }
    };

    const handleConfirmDelete = async () => {
        if (!groupToDelete) return;
        setIsDeleting(true);
        try {
            await searchSynonymsApi.remove(groupToDelete.id);
            setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
            showSuccess(`Grupo "${groupToDelete.nombreGrupo}" eliminado.`);
            setIsDeleteOpen(false);
            setGroupToDelete(null);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'No se pudo eliminar el grupo de sinónimos';
            showError(message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className={styles.page} aria-label="Sinónimos de Búsqueda">
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.headerTitle}>Sinónimos de Búsqueda</h1>
                    <p className={styles.lead}>
                        Administra grupos de términos equivalentes para el buscador global multicampo del catálogo.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button type="button" variant="primary" onClick={handleOpenCreate}>
                        + Nuevo Grupo de Sinónimos
                    </Button>
                </div>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.statsBar}>
                    <span className={styles.statItem}>
                        Total: <strong>{stats.total}</strong>
                    </span>
                    <span className={styles.statItem}>
                        Activos: <strong style={{ color: '#22c55e' }}>{stats.activos}</strong>
                    </span>
                    <span className={styles.statItem}>
                        Pausados: <strong style={{ color: 'var(--muted)' }}>{stats.pausados}</strong>
                    </span>
                </div>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Buscar por grupo o término..."
                        aria-label="Buscar por grupo o término"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {error && (
                <div className={styles.errorBox} role="alert">
                    <span>{error}</span>
                    <Button type="button" variant="secondary" onClick={() => void fetchGroups()}>
                        Reintentar
                    </Button>
                </div>
            )}

            {loading && groups.length === 0 ? (
                <div className={styles.loadingBox}>
                    <p>Cargando grupos de sinónimos...</p>
                </div>
            ) : (
                <AdminSynonymsTable
                    groups={filteredGroups}
                    searchFilter={searchFilter}
                    onToggleStatus={(g) => void handleToggleStatus(g)}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                />
            )}

            <SynonymModalForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                groupToEdit={groupToEdit}
                onSave={handleSave}
                isSaving={isSaving}
            />

            {isDeleteOpen && groupToDelete && (
                <div
                    className={styles.confirmOverlay}
                    onClick={() => setIsDeleteOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-delete-synonym-title"
                >
                    <div
                        className={styles.confirmModal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.confirmHeader}>
                            <h2 id="confirm-delete-synonym-title">Eliminar grupo de sinónimos</h2>
                        </div>
                        <div className={styles.confirmBody}>
                            <p>
                                ¿Estás seguro de que deseas eliminar el grupo{' '}
                                <strong>«{groupToDelete.nombreGrupo}»</strong>?
                            </p>
                            <p className={styles.confirmWarning}>
                                Esta acción eliminará las equivalencias del buscador de inmediato. Si solo deseas
                                desactivarlo temporalmente, puedes usar la opción «Pausar».
                            </p>
                        </div>
                        <div className={styles.confirmFooter}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsDeleteOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => void handleConfirmDelete()}
                                disabled={isDeleting}
                                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar definitivamente'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AdminSynonymsView;
