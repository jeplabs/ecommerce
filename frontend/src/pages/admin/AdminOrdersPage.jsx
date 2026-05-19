import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar/Navbar';
import AdminOrdersTable from '../../components/admin/AdminOrdersTable/AdminOrdersTable';
import OrderDetailModal from '../../components/profile/OrderDetailModal/OrderDetailModal';
import { useAdminOrdersLogic } from '../../hooks/useAdminOrdersLogic';
import { ORDEN_ESTADOS_FILTRO } from '../../utils/ordenEstados';
import './AdminOrdersPage.css';

export default function AdminOrdersPage() {
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

    const handleSaveEstado = async (ordenId, nuevoEstado) => {
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
            <Navbar />
            <main className="admin-orders-page">
                <header className="admin-orders-page__header">
                    <div>
                        <Link to="/admin" className="admin-orders-page__back">
                            ← Volver al panel
                        </Link>
                        <h1>Historial de pedidos</h1>
                        <p className="admin-orders-page__lead">
                            Gestiona el estado de las compras de los clientes
                        </p>
                    </div>
                    <div className="admin-orders-page__filters">
                        <label className="admin-orders-page__filter-label" htmlFor="filtro-estado-orden">
                            Filtrar por estado
                        </label>
                        <select
                            id="filtro-estado-orden"
                            className="admin-orders-page__filter-select"
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                        >
                            {ORDEN_ESTADOS_FILTRO.map((opt) => (
                                <option key={opt.value || 'all'} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </header>

                {totalElements > 0 && (
                    <p className="admin-orders-page__count">
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
                    <div className="admin-orders-page__pagination">
                        <button
                            type="button"
                            className="admin-orders-page__page-btn"
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
                            className="admin-orders-page__page-btn"
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
                onCancel={undefined}
                cancelling={false}
            />
        </>
    );
}
