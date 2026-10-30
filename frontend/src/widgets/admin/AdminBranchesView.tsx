import { useState } from 'react';
import { useToast } from '@/app/providers';
import {
    useAdminBranches,
    AdminBranchesTable,
    BranchModalForm,
} from '@/features/admin';
import type { BranchApi, CreateBranchRequest } from '@/entities/branch';
import { Button } from '@/shared/ui/Button';
import styles from './AdminBranchesView.module.css';

export default function AdminBranchesView() {
    const {
        branches,
        loading,
        error,
        crearSucursal,
        actualizarSucursal,
        activarSucursal,
        desactivarSucursal,
    } = useAdminBranches();

    const { showSuccess, showError } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [branchToEdit, setBranchToEdit] = useState<BranchApi | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenCreate = () => {
        setBranchToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (branch: BranchApi) => {
        setBranchToEdit(branch);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setBranchToEdit(null);
    };

    const handleSave = async (payload: CreateBranchRequest): Promise<boolean> => {
        setIsSaving(true);
        try {
            if (branchToEdit) {
                const res = await actualizarSucursal(branchToEdit.id, payload);
                if (res.success) {
                    showSuccess(`Sucursal "${payload.nombre}" actualizada`);
                    return true;
                }
                showError(res.error || 'No se pudo actualizar la sucursal');
                return false;
            } else {
                const res = await crearSucursal(payload);
                if (res.success) {
                    showSuccess(`Sucursal "${payload.nombre}" creada con éxito`);
                    return true;
                }
                showError(res.error || 'No se pudo crear la sucursal');
                return false;
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (branch: BranchApi) => {
        if (branch.activo) {
            const confirmed = window.confirm(
                `¿Deseas desactivar la sucursal "${branch.nombre}"? Ya no aparecerá como opción de retiro en el checkout.`
            );
            if (!confirmed) return;

            const res = await desactivarSucursal(branch.id);
            if (res.success) {
                showSuccess(`Sucursal "${branch.nombre}" desactivada`);
            } else {
                showError(res.error || 'No se pudo desactivar la sucursal');
            }
        } else {
            const res = await activarSucursal(branch.id);
            if (res.success) {
                showSuccess(`Sucursal "${branch.nombre}" reactivada para el checkout`);
            } else {
                showError(res.error || 'No se pudo activar la sucursal');
            }
        }
    };

    const totalActivas = branches.filter((b) => b.activo).length;
    const totalInactivas = branches.length - totalActivas;

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>Sucursales de retiro</h1>
                    <p className={styles.lead}>
                        Administra los puntos físicos disponibles para entrega y retiro en tienda.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Button type="button" variant="primary" onClick={handleOpenCreate}>
                        + Nueva sucursal
                    </Button>
                </div>
            </header>

            {!loading && !error && (
                <div className={styles.statsBar}>
                    <span className={styles.statItem}>
                        Total: <strong>{branches.length}</strong>
                    </span>
                    <span>·</span>
                    <span className={styles.statItem}>
                        Activas: <strong>{totalActivas}</strong>
                    </span>
                    <span>·</span>
                    <span className={styles.statItem}>
                        Inactivas: <strong>{totalInactivas}</strong>
                    </span>
                </div>
            )}

            <AdminBranchesTable
                branches={branches}
                loading={loading}
                error={error}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleStatus}
            />

            <BranchModalForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                branchToEdit={branchToEdit}
                onSave={handleSave}
                isSaving={isSaving}
            />
        </main>
    );
}

