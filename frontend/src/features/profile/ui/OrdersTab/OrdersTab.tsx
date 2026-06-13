import { useProfile, useToast } from '@/app/providers';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';

import { formatCurrency, formatDateTime, formatEstadoOrden } from '@/shared/lib/format';
import type { OrderStatus } from '@/entities/order';
import OrderDetailModal from '../OrderDetailModal/OrderDetailModal';
import { Button } from '@/shared/ui/Button';
import { profileOrderDetailPath } from '@/features/profile/lib/profileRoutes';
import styles from './OrdersTab.module.css';

const ESTADO_CLASS: Partial<Record<OrderStatus, string>> = {
    PENDIENTE: styles.statusPending,
    CONFIRMADA: styles.statusConfirmed,
    EN_PROCESO: styles.statusProcessing,
    ENVIADA: styles.statusShipped,
    ENTREGADA: styles.statusDelivered,
    CANCELADA: styles.statusCancelled,
};

function parseOrderIdParam(idParam: string | undefined): number | null {
    if (!idParam) return null;
    const parsed = Number(idParam);
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
        return null;
    }
    return parsed;
}

export default function OrdersTab() {
    const navigate = useNavigate();
    const { id: idParam } = useParams<{ id?: string }>();
    const orderIdFromUrl = parseOrderIdParam(idParam);
    const isDetailOpen = orderIdFromUrl != null;

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
        obtenerDetalleLocal,
        rememberDetalle,
    } = ordenes;

    const [cancelling, setCancelling] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const modalOrden =
        orderIdFromUrl != null ? obtenerDetalleLocal(orderIdFromUrl) : null;
    const isFetchingRemote = detailLoading && modalOrden == null;

    useEffect(() => {
        if (!loaded) {
            fetchOrdenes(0);
            setLoaded(true);
        }
    }, [loaded, fetchOrdenes]);

    useEffect(() => {
        if (idParam && orderIdFromUrl == null) {
            navigate('/profile/ordenes', { replace: true });
            return;
        }

        if (orderIdFromUrl == null) {
            cerrarDetalle();
            return;
        }

        const local = obtenerDetalleLocal(orderIdFromUrl);
        if (local) {
            if (ordenSeleccionada?.id !== orderIdFromUrl) {
                rememberDetalle(local);
            }
            return;
        }

        void cargarDetalle(orderIdFromUrl).then((res) => {
            if (!res?.success) {
                navigate('/profile/ordenes', { replace: true });
                if (res?.error) {
                    showError(res.error);
                }
            }
        });
    }, [
        idParam,
        orderIdFromUrl,
        ordenSeleccionada?.id,
        obtenerDetalleLocal,
        rememberDetalle,
        cargarDetalle,
        cerrarDetalle,
        navigate,
        showError,
    ]);

    const closeDetailModal = () => {
        cerrarDetalle();
        if (isDetailOpen) {
            navigate('/profile/ordenes');
        }
    };

    const handleDetailClick = (id: number) => {
        if (orderIdFromUrl === id && isDetailOpen) {
            closeDetailModal();
            return;
        }

        navigate(profileOrderDetailPath(id));
    };

    const handleCancel = async (id: number) => {
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
        <section className={styles.root} aria-label="Historial de pedidos">
            <div className={styles.header}>
                <h2>Mis pedidos</h2>
                <p>
                    {totalElements > 0
                        ? `${totalElements} pedido${totalElements !== 1 ? 's' : ''} en total`
                        : 'Consulta el estado de tus compras'}
                </p>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <div className={styles.layout}>
                <div className={styles.tableWrap}>
                    {loading ? (
                        <p className={styles.loading}>Cargando pedidos…</p>
                    ) : lista.length === 0 ? (
                        <div className={styles.empty}>
                            <p>Aún no tienes pedidos.</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableScroll}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Pedido</th>
                                            <th scope="col">Fecha</th>
                                            <th scope="col">Estado</th>
                                            <th scope="col" className={styles.colTotal}>Total</th>
                                            <th scope="col" className={styles.colAction}>Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lista.map((orden) => {
                                            const isRowActive = orderIdFromUrl === orden.id;

                                            return (
                                                <tr
                                                    key={orden.id}
                                                    className={clsx(isRowActive && styles.rowSelected)}
                                                >
                                                    <td className={styles.cellId} data-label="Pedido">
                                                        #{orden.id}
                                                    </td>
                                                    <td className={styles.cellDate} data-label="Fecha">
                                                        {formatDateTime(orden.creadoAt)}
                                                    </td>
                                                    <td className={styles.cellStatus} data-label="Estado">
                                                        <span className={clsx(styles.status, ESTADO_CLASS[orden.estado])}>
                                                            {formatEstadoOrden(orden.estado)}
                                                        </span>
                                                    </td>
                                                    <td className={styles.cellTotal} data-label="Total">
                                                        {formatCurrency(orden.total)}
                                                    </td>
                                                    <td className={styles.cellAction} data-label="Acción">
                                                        <button
                                                            type="button"
                                                            className={styles.detailBtn}
                                                            onClick={() => handleDetailClick(orden.id)}
                                                        >
                                                            {orderIdFromUrl === orden.id && isDetailOpen
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
                                <div className={styles.pagination}>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className={styles.pageBtn}
                                        onClick={() => irAPagina(page - 1)}
                                        disabled={page === 0 || loading}
                                    >
                                        Anterior
                                    </Button>
                                    <span>Página {page + 1} de {totalPages}</span>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className={styles.pageBtn}
                                        onClick={() => irAPagina(page + 1)}
                                        disabled={page >= totalPages - 1 || loading}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <OrderDetailModal
                isOpen={isDetailOpen}
                loading={isFetchingRemote}
                orden={modalOrden}
                onClose={closeDetailModal}
                onCancel={handleCancel}
                cancelling={cancelling}
            />
        </section>
    );
}
