import { useEffect, useState } from 'react';
import { useProfile } from '../../../context/ProfileContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDateTime, formatEstadoOrden } from '../../../utils/formatters';
import OrderDetail from '../OrderDetail/OrderDetail';
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

    useEffect(() => {
        if (!loaded) {
            fetchOrdenes(0);
            setLoaded(true);
        }
    }, [loaded, fetchOrdenes]);

    const handleSelectOrder = async (id) => {
        if (ordenSeleccionada?.id === id) {
            cerrarDetalle();
            return;
        }
        await cargarDetalle(id);
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

            <div className={`orders-tab__layout ${ordenSeleccionada ? 'orders-tab__layout--split' : ''}`}>
                <div className="orders-tab__table-wrap">
                    {loading ? (
                        <p className="orders-tab__loading">Cargando pedidos…</p>
                    ) : lista.length === 0 ? (
                        <div className="orders-tab__empty">
                            <p>Aún no tienes pedidos.</p>
                        </div>
                    ) : (
                        <>
                            <div className="orders-table" role="table" aria-label="Lista de pedidos">
                                <OrdersTableHeader />
                                {lista.map((orden) => (
                                    <button
                                        key={orden.id}
                                        type="button"
                                        className={`orders-table__row ${ordenSeleccionada?.id === orden.id ? 'orders-table__row--selected' : ''}`}
                                        onClick={() => handleSelectOrder(orden.id)}
                                        role="row"
                                    >
                                        <span className="orders-table__cell orders-table__cell--id" data-label="Pedido">
                                            #{orden.id}
                                        </span>
                                        <span className="orders-table__cell" data-label="Fecha">
                                            {formatDateTime(orden.creadoAt)}
                                        </span>
                                        <span className="orders-table__cell" data-label="Estado">
                                            <span className={`orders-table__status ${ESTADO_CLASS[orden.estado] || ''}`}>
                                                {formatEstadoOrden(orden.estado)}
                                            </span>
                                        </span>
                                        <span className="orders-table__cell orders-table__cell--total" data-label="Total">
                                            {formatCurrency(orden.total)}
                                        </span>
                                        <span className="orders-table__cell orders-table__cell--action" aria-hidden="true">
                                            {detailLoading && ordenSeleccionada?.id === orden.id ? '…' : '→'}
                                        </span>
                                    </button>
                                ))}
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

                {ordenSeleccionada && (
                    <OrderDetail
                        orden={ordenSeleccionada}
                        onClose={cerrarDetalle}
                        onCancel={handleCancel}
                        cancelling={cancelling}
                    />
                )}
            </div>
        </section>
    );
}

function OrdersTableHeader() {
    return (
        <div className="orders-table__header" role="row">
            <span className="orders-table__cell" role="columnheader">Pedido</span>
            <span className="orders-table__cell" role="columnheader">Fecha</span>
            <span className="orders-table__cell" role="columnheader">Estado</span>
            <span className="orders-table__cell" role="columnheader">Total</span>
            <span className="orders-table__cell orders-table__cell--action" role="columnheader" aria-hidden="true" />
        </div>
    );
}
