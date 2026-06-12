import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '@/entities/order/api';
import type { OrderApi, OrderStatus } from '@/entities/order';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { useToast } from '@/app/providers';
import { ApiError } from '@/shared';
import type {
    AdminActionResult,
    AdminOrderStatusFilter,
    UseAdminOrdersLogicResult,
} from './types';

const PAGE_SIZE = 10;

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

/**
 * Listado paginado de órdenes (admin), filtro por estado y actualización de estado.
 */
export function useAdminOrdersLogic(): UseAdminOrdersLogicResult {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [ordenes, setOrdenes] = useState<OrderApi[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [estadoFiltro, setEstadoFiltroState] = useState<AdminOrderStatusFilter>('');
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [ordenDetalle, setOrdenDetalle] = useState<OrderApi | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const setEstadoFiltro = useCallback((valor: AdminOrderStatusFilter) => {
        setEstadoFiltroState(valor);
        setPage(0);
    }, []);

    const fetchPage = useCallback(
        async (pageNum: number) => {
            if (!localStorage.getItem('token')) {
                navigate('/login', { replace: true });
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await orderApi.listarOrdenesAdmin({
                    page: pageNum,
                    size: PAGE_SIZE,
                    estado: estadoFiltro || undefined,
                });
                setOrdenes(data.content || []);
                setPage(data.number ?? pageNum);
                setTotalPages(data.totalPages ?? 0);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return;
                }
                console.error('Error al listar órdenes (admin)', err);
                setError(toErrorMessage(err));
                setOrdenes([]);
            } finally {
                setLoading(false);
            }
        },
        [estadoFiltro, handleAuthError, navigate]
    );

    useEffect(() => {
        fetchPage(page);
    }, [page, estadoFiltro, fetchPage]);

    const irAPagina = useCallback(
        (nuevaPagina: number) => {
            if (nuevaPagina < 0 || nuevaPagina >= totalPages) return;
            setPage(nuevaPagina);
        },
        [totalPages]
    );

    const updateEstadoOrden = useCallback(
        async (
            ordenId: number,
            nuevoEstado: OrderStatus
        ): Promise<AdminActionResult<OrderApi>> => {
            setUpdatingId(ordenId);
            try {
                const updated = await orderApi.actualizarEstadoOrdenAdmin(ordenId, nuevoEstado);
                setOrdenes((prev) => prev.map((o) => (o.id === ordenId ? updated : o)));
                if (ordenDetalle?.id === ordenId) {
                    setOrdenDetalle(updated);
                }
                showSuccess('Estado del pedido actualizado');
                return { success: true, data: updated };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                const message = toErrorMessage(err);
                showError(message);
                return { success: false, error: message };
            } finally {
                setUpdatingId(null);
            }
        },
        [handleAuthError, showSuccess, showError, ordenDetalle]
    );

    const abrirDetalle = useCallback(
        async (ordenId: number): Promise<AdminActionResult<OrderApi>> => {
            setDetailModalOpen(true);
            setOrdenDetalle(null);
            setDetailLoading(true);
            try {
                const data = await orderApi.obtenerOrdenAdmin(ordenId);
                setOrdenDetalle(data);
                return { success: true, data };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                const message = toErrorMessage(err);
                showError(message);
                setDetailModalOpen(false);
                return { success: false, error: message };
            } finally {
                setDetailLoading(false);
            }
        },
        [handleAuthError, showError]
    );

    const cerrarDetalle = useCallback(() => {
        setDetailModalOpen(false);
        setOrdenDetalle(null);
    }, []);

    return {
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
        refetch: () => fetchPage(page),
        detailModalOpen,
        ordenDetalle,
        detailLoading,
        abrirDetalle,
        cerrarDetalle,
    };
}
