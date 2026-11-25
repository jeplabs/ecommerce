import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { useAdminBanners } from '../../hooks/useAdminBanners';
import { AdminBannersTable } from '../AdminBannersTable';
import { BannerModalForm } from '../BannerModalForm';
import type { BannerApi, CreateBannerRequest, UpdateBannerRequest } from '../../types';
import styles from './AdminBannersView.module.css';

export function AdminBannersView() {
    const {
        banners,
        loading,
        error,
        saving,
        reordering,
        createBanner,
        updateBanner,
        toggleEstado,
        moveUp,
        moveDown,
        deleteBanner,
    } = useAdminBanners('HERO_CAROUSEL');

    // Modales de formulario y confirmación
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [bannerToEdit, setBannerToEdit] = useState<BannerApi | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<BannerApi | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Contadores de métricas
    const stats = useMemo(() => {
        const total = banners.length;
        const activos = banners.filter((b) => b.activo).length;
        const pausados = total - activos;
        return { total, activos, pausados };
    }, [banners]);

    const handleOpenCreate = () => {
        setBannerToEdit(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (banner: BannerApi) => {
        setBannerToEdit(banner);
        setIsFormOpen(true);
    };

    const handleOpenDelete = (banner: BannerApi) => {
        setBannerToDelete(banner);
        setIsDeleteOpen(true);
    };

    const handleSave = async (
        payload: CreateBannerRequest | UpdateBannerRequest
    ): Promise<boolean> => {
        if (bannerToEdit) {
            return updateBanner(bannerToEdit.id, payload);
        }
        return createBanner(payload as CreateBannerRequest);
    };

    const handleConfirmDelete = async () => {
        if (!bannerToDelete) return;
        setIsDeleting(true);
        const success = await deleteBanner(bannerToDelete.id);
        setIsDeleting(false);
        if (success) {
            setIsDeleteOpen(false);
            setBannerToDelete(null);
        }
    };

    return (
        <section className={styles.page} aria-label="Gestión de Banners del Home">
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1 className={styles.headerTitle}>Gestión de Banners del Home</h1>
                    <p className={styles.lead}>
                        Administra el carrusel principal, vigencias, enlaces y el orden de visualización de las campañas.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="primary"
                    onClick={handleOpenCreate}
                >
                    + Nuevo Banner
                </Button>
            </header>

            {/* Métricas rápidas */}
            <div className={styles.statsBar}>
                <div className={styles.statItem}>
                    <span>Total de Banners:</span>
                    <span className={styles.statValue}>{stats.total}</span>
                </div>
                <div className={styles.statItem}>
                    <span>Activos en tienda:</span>
                    <span className={styles.statValue} style={{ color: '#22c55e' }}>
                        {stats.activos}
                    </span>
                </div>
                <div className={styles.statItem}>
                    <span>Pausados:</span>
                    <span className={styles.statValue} style={{ color: 'var(--muted)' }}>
                        {stats.pausados}
                    </span>
                </div>
            </div>

            {error && (
                <div className={styles.errorState} role="alert">
                    <p>{error}</p>
                </div>
            )}

            {/* Tabla con reordenamiento y acciones */}
            <AdminBannersTable
                banners={banners}
                loading={loading}
                reordering={reordering}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onToggleEstado={toggleEstado}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
            />

            {/* Modal de Crear / Editar */}
            <BannerModalForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                bannerToEdit={bannerToEdit}
                onSave={handleSave}
                isSaving={saving}
            />

            {/* Modal de Confirmación de Eliminación */}
            {isDeleteOpen && bannerToDelete && (
                <div
                    className={styles.confirmOverlay}
                    onClick={() => setIsDeleteOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-delete-banner-title"
                >
                    <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.confirmHeader}>
                            <h2 id="confirm-delete-banner-title">Eliminar banner</h2>
                        </div>
                        <div className={styles.confirmBody}>
                            <p>
                                ¿Estás seguro de que deseas eliminar definitivamente el banner{' '}
                                <strong>«{bannerToDelete.titulo}»</strong>?
                            </p>
                            <p className={styles.confirmWarning}>
                                Esta acción eliminará el registro de la base de datos de manera irreversible. Si solo deseas pausar la campaña, puedes usar la opción «Pausar».
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
                                onClick={handleConfirmDelete}
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

export default AdminBannersView;
