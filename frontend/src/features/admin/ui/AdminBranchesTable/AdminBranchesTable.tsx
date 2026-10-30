import clsx from 'clsx';
import type { BranchApi } from '@/entities/branch';
import styles from './AdminBranchesTable.module.css';

interface AdminBranchesTableProps {
    branches: BranchApi[];
    loading?: boolean;
    error?: string | null;
    onEdit: (branch: BranchApi) => void;
    onToggleStatus: (branch: BranchApi) => void;
}

export default function AdminBranchesTable({
    branches,
    loading = false,
    error = null,
    onEdit,
    onToggleStatus,
}: AdminBranchesTableProps) {
    if (loading) {
        return (
            <div className={styles.root}>
                <p className={styles.loadingState}>Cargando listado de sucursales…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.root}>
                <p className={styles.emptyState}>{error}</p>
            </div>
        );
    }

    if (branches.length === 0) {
        return (
            <div className={styles.root}>
                <p className={styles.emptyState}>No hay sucursales registradas en el sistema.</p>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.scroll}>
                <table className={styles.grid}>
                    <thead>
                        <tr>
                            <th>Orden / Sucursal</th>
                            <th>Ubicación</th>
                            <th>Contacto & Horario</th>
                            <th className={styles.colStatus}>Estado</th>
                            <th className={styles.colActions}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch) => {
                            const isActiva = branch.activo;
                            return (
                                <tr
                                    key={branch.id}
                                    className={clsx(!isActiva && styles.rowInactive)}
                                >
                                    <td>
                                        <div className={styles.branchName}>
                                            {branch.ordenVisualizacion != null && (
                                                <span
                                                    className={styles.orderBadge}
                                                    title={`Orden de visualización: ${branch.ordenVisualizacion}`}
                                                >
                                                    #{branch.ordenVisualizacion}
                                                </span>
                                            )}
                                            <span>{branch.nombre}</span>
                                        </div>
                                        {branch.referencias && (
                                            <div className={styles.subDetail}>
                                                Ref: {branch.referencias}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div>{branch.direccion}</div>
                                        <div className={styles.subDetail}>
                                            {branch.ciudad}
                                            {branch.estado ? `, ${branch.estado}` : ''} ({branch.pais})
                                            {branch.codigoPostal ? ` · CP ${branch.codigoPostal}` : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <div>Tel: {branch.telefono}</div>
                                        <div className={styles.subDetail}>{branch.horario}</div>
                                    </td>
                                    <td className={styles.colStatus}>
                                        {isActiva ? (
                                            <span className={styles.badgeActive}>● Activa</span>
                                        ) : (
                                            <span className={styles.badgeInactive}>○ Inactiva</span>
                                        )}
                                    </td>
                                    <td className={styles.colActions}>
                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                className={styles.btnAction}
                                                onClick={() => onEdit(branch)}
                                                aria-label={`Editar ${branch.nombre}`}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className={clsx(
                                                    styles.btnAction,
                                                    isActiva ? styles.btnDeactivate : styles.btnActivate
                                                )}
                                                onClick={() => onToggleStatus(branch)}
                                                aria-label={
                                                    isActiva
                                                        ? `Desactivar ${branch.nombre}`
                                                        : `Activar ${branch.nombre}`
                                                }
                                            >
                                                {isActiva ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

