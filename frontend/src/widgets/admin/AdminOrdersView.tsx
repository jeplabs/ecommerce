import type { OrderStatus } from '@/entities/order';
import AdminOrdersTable from '@/features/admin/ui/AdminOrdersTable/AdminOrdersTable';
import OrderDetailModal from '@/features/profile/ui/OrderDetailModal/OrderDetailModal';
import { useAdminOrdersLogic } from '@/features/admin';
import type { AdminOrderStatusFilter } from '@/features/admin/model/types';
import { ORDEN_ESTADOS_FILTRO } from '@/entities/order';
import { Select } from '@/shared/ui/Select';
import styles from './AdminOrdersView.module.css';

export default function AdminOrdersView() {
    const {
        ordenes,
        page,
        totalPages,
        totalElements,
        loading,
        estadoFiltro,
        setEstadoFiltro,
        error,
        updatingId,
        irAPagina,
        updateEstadoOrden,
        detailModalOpen,
        ordenDetalle,
        detailLoading,
        abrirDetalle,
        cerrarDetalle,
    } = useAdminOrdersLogic();

    const handleSaveEstado = async (ordenId: number, nuevoEstado: OrderStatus) => {
        if (nuevoEstado === 'CANCELADA') {
            const ok = window.confirm(
                '¿Cancelar este pedido? El stock de los productos se devolverá al inventario.'
            );
            if (!ok) return;
        }
        await updateEstadoOrden(ordenId, nuevoEstado);
    };

    return (
        <>
            <main className={styles.page}>
                <header className={styles.header}>
                    <div>
                        <h1>Historial de pedidos</h1>
                        <p className={styles.lead}>
                            Gestiona el estado de las compras de los clientes
                        </p>
                    </div>
                    <div className={styles.filters}>
                        <label
                            className={styles.filterLabel}
                            htmlFor="filtro-estado-orden"
                        >
                            Filtrar por estado
                        </label>
                        <Select
                            id="filtro-estado-orden"
                            className={styles.filterSelect}
                            value={estadoFiltro}
                            onChange={(e) =>
                                setEstadoFiltro(e.target.value as AdminOrderStatusFilter)
                            }
                        >
                            {ORDEN_ESTADOS_FILTRO.map((opt) => (
                                <option key={opt.value || 'all'} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </header>

                {totalElements > 0 && (
                    <p className={styles.count}>
                        {totalElements} pedido{totalElements !== 1 ? 's' : ''} en total
                    </p>
                )}

                <AdminOrdersTable
                    ordenes={ordenes}
                    loading={loading}
                    error={error}
                    updatingId={updatingId}
                    onSaveEstado={handleSaveEstado}
                    onVerDetalle={abrirDetalle}
                />

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            onClick={() => irAPagina(page - 1)}
                            disabled={page === 0 || loading}
                        >
                            Anterior
                        </button>
                        <span>
                            Página {page + 1} de {totalPages}
                        </span>
                        <button
                            type="button"
                            className={styles.pageBtn}
                            onClick={() => irAPagina(page + 1)}
                            disabled={page >= totalPages - 1 || loading}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </main>

            <OrderDetailModal
                isOpen={detailModalOpen}
                loading={detailLoading}
                orden={ordenDetalle}
                onClose={cerrarDetalle}
                cancelling={false}
            />
        </>
    );
}
