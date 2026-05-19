import { useEffect, useState } from 'react';
import { useProfile } from '../../../context/ProfileContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '../../../utils/formatters';
import OrderDetailModal from '../OrderDetailModal/OrderDetailModal';
import './OrdersTab.css';

const ESTADO_CLASS = {
    PENDIENTE: 'status--pending',
    CONFIRMADA: 'status--confirmed',
    EN_PROCESO: 'status--processing',
    ENVIADA: 'status--shipped',
    ENTREGADA: 'status--delivered',
    CANCELADA: 'status--cancelled',
};

export default function OrdersTab() {
    const { ordenes } = useProfile();
    const { showSuccess, showError } = useToast();

    const {
        ordenes: lista,
        page,
        totalPages,
        totalElements,
        loading,
        detailLoading,
        ordenSeleccionada,
        error,
        fetchOrdenes,
        cargarDetalle,
        cerrarDetalle,
        cancelarOrden,
        irAPagina,
    } = ordenes;

    const [cancelling, setCancelling] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loadingDetailId, setLoadingDetailId] = useState(null);

    useEffect(() => {
        if (!loaded) {
            fetchOrdenes(0);
            setLoaded(true);
        }
    }, [loaded, fetchOrdenes]);

    const closeDetailModal = () => {
        setDetailModalOpen(false);
        setLoadingDetailId(null);
        cerrarDetalle();
    };

    const handleDetailClick = async (id) => {
        if (detailModalOpen && ordenSeleccionada?.id === id && !detailLoading) {
            closeDetailModal();
            return;
        }

        setDetailModalOpen(true);
        setLoadingDetailId(id);
        const res = await cargarDetalle(id);
        setLoadingDetailId(null);

        if (!res?.success) {
            setDetailModalOpen(false);
            if (res?.error) {
                showError(res.error);
            }
        }
    };

    const handleCancel = async (id) => {
        setCancelling(true);
        const result = await cancelarOrden(id);
        if (result.success) {
            showSuccess('Pedido cancelado');
        } else {
            showError(result.error);
        }
        setCancelling(false);
    };

    return (
        <section className="orders-tab" aria-label="Historial de pedidos">
            <div className="orders-tab__header">
                <h2>Mis pedidos</h2>
                <p>
                    {totalElements > 0
                        ? `${totalElements} pedido${totalElements !== 1 ? 's' : ''} en total`
                        : 'Consulta el estado de tus compras'}
                </p>
            </div>

            {error && <p className="orders-tab__error" role="alert">{error}</p>}

            <div className="orders-tab__layout">
                <div className="orders-tab__table-wrap">
                    {loading ? (
                        <p className="orders-tab__loading">Cargando pedidos…</p>
                    ) : lista.length === 0 ? (
                        <div className="orders-tab__empty">
                            <p>Aún no tienes pedidos.</p>
                        </div>
                    ) : (
                        <>
                            <div className="orders-table-scroll">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Pedido</th>
                                            <th scope="col">Fecha</th>
                                            <th scope="col">Estado</th>
                                            <th scope="col" className="orders-table__col-total">Total</th>
                                            <th scope="col" className="orders-table__col-action">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lista.map((orden) => {
                                            const isRowLoading = loadingDetailId === orden.id && detailLoading;
                                            const isRowActive =
                                                ordenSeleccionada?.id === orden.id ||
                                                (isRowLoading && detailModalOpen);

                                            return (
                                                <tr
                                                    key={orden.id}
                                                    className={`orders-table__row ${isRowActive ? 'orders-table__row--selected' : ''}`}
                                                >
                                                    <td className="orders-table__cell-id" data-label="Pedido">
                                                        #{orden.id}
                                                    </td>
                                                    <td className="orders-table__cell-date" data-label="Fecha">
                                                        {formatDateTime(orden.creadoAt)}
                                                    </td>
                                                    <td className="orders-table__cell-status" data-label="Estado">
                                                        <span className={`orders-table__status ${ESTADO_CLASS[orden.estado] || ''}`}>
                                                            {formatEstadoOrden(orden.estado)}
                                                        </span>
                                                    </td>
                                                    <td className="orders-table__cell-total" data-label="Total">
                                                        {formatCurrency(orden.total)}
                                                    </td>
                                                    <td className="orders-table__cell-action" data-label="Acción">
                                                        <button
                                                            type="button"
                                                            className="orders-table__detail-btn"
                                                            onClick={() => handleDetailClick(orden.id)}
                                                            disabled={isRowLoading}
                                                        >
                                                            {isRowLoading
                                                                ? 'Cargando…'
                                                                : detailModalOpen && ordenSeleccionada?.id === orden.id
                                                                    ? 'Cerrar detalle'
                                                                    : 'Ver detalle'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="orders-tab__pagination">
                                    <button
                                        type="button"
                                        className="profile-btn profile-btn--secondary"
                                        onClick={() => irAPagina(page - 1)}
                                        disabled={page === 0 || loading}
                                    >
                                        Anterior
                                    </button>
                                    <span>Página {page + 1} de {totalPages}</span>
                                    <button
                                        type="button"
                                        className="profile-btn profile-btn--secondary"
                                        onClick={() => irAPagina(page + 1)}
                                        disabled={page >= totalPages - 1 || loading}
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <OrderDetailModal
                isOpen={detailModalOpen}
                loading={detailLoading}
                orden={ordenSeleccionada}
                onClose={closeDetailModal}
                onCancel={handleCancel}
                cancelling={cancelling}
            />
        </section>
    );
}
