import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../api';
import type { OrderApi } from './schemas/api';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';

const PAGE_SIZE = 10;

export type OrderActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string };

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

export function useOrdenesLogic() {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState<OrderApi[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrderApi | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const fetchOrdenes = useCallback(
        async (pageNum = 0) => {
            setLoading(true);
            setError(null);
            try {
                const data = await orderApi.listarMisOrdenes(pageNum, PAGE_SIZE);
                setOrdenes(data.content ?? []);
                setPage(data.number ?? pageNum);
                setTotalPages(data.totalPages ?? 0);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) return;
                setError(toErrorMessage(err));
                setOrdenes([]);
            } finally {
                setLoading(false);
            }
        },
        [handleAuthError]
    );

    const cargarDetalle = useCallback(
        async (ordenId: number): Promise<OrderActionResult<OrderApi>> => {
            setDetailLoading(true);
            setOrdenSeleccionada(null);
            setError(null);
            try {
                const data = await orderApi.obtenerOrden(ordenId);
                setOrdenSeleccionada(data);
                return { success: true, data };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                setError(toErrorMessage(err));
                return { success: false, error: toErrorMessage(err) };
            } finally {
                setDetailLoading(false);
            }
        },
        [handleAuthError]
    );

    const cerrarDetalle = useCallback(() => {
        setOrdenSeleccionada(null);
    }, []);

    const cancelarOrden = useCallback(
        async (ordenId: number): Promise<OrderActionResult<OrderApi>> => {
            try {
                const data = await orderApi.cancelarOrden(ordenId);
                setOrdenSeleccionada(data);
                await fetchOrdenes(page);
                return { success: true, data };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: toErrorMessage(err) };
            }
        },
        [fetchOrdenes, page, handleAuthError]
    );

    const irAPagina = useCallback(
        (nuevaPagina: number) => {
            if (nuevaPagina < 0 || nuevaPagina >= totalPages) return;
            void fetchOrdenes(nuevaPagina);
        },
        [fetchOrdenes, totalPages]
    );

    return {
        ordenes,
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
    };
}
