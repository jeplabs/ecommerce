import { useState, useCallback, useEffect, useRef } from 'react';
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

function mergeDetalleCache(
    prev: Record<number, OrderApi>,
    ordenes: OrderApi[]
): Record<number, OrderApi> {
    if (ordenes.length === 0) return prev;

    let changed = false;
    const next = { ...prev };

    for (const orden of ordenes) {
        if (next[orden.id] !== orden) {
            next[orden.id] = orden;
            changed = true;
        }
    }

    return changed ? next : prev;
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
    const [detalleById, setDetalleById] = useState<Record<number, OrderApi>>({});
    const [error, setError] = useState<string | null>(null);
    const pageRef = useRef(page);
    const ordenesCountRef = useRef(0);
    pageRef.current = page;
    ordenesCountRef.current = ordenes.length;

    const handleAuthError = useCallback(
        (status: number | undefined) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const rememberDetalle = useCallback((orden: OrderApi) => {
        setOrdenSeleccionada(orden);
        setDetalleById((prev) => {
            if (prev[orden.id] === orden) return prev;
            return { ...prev, [orden.id]: orden };
        });
    }, []);

    const obtenerDetalleLocal = useCallback(
        (ordenId: number): OrderApi | null => {
            const fromList = ordenes.find((orden) => orden.id === ordenId);
            if (fromList) return fromList;
            if (ordenSeleccionada?.id === ordenId) return ordenSeleccionada;
            return detalleById[ordenId] ?? null;
        },
        [ordenes, ordenSeleccionada, detalleById]
    );

    const fetchOrdenes = useCallback(
        async (pageNum = 0) => {
            if (ordenesCountRef.current === 0 || pageNum !== pageRef.current) {
                setLoading(true);
            }
            setError(null);
            try {
                const data = await orderApi.listarMisOrdenes(pageNum, PAGE_SIZE);
                const content = data.content ?? [];
                setOrdenes(content);
                setDetalleById((prev) => mergeDetalleCache(prev, content));
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

    const initializedRef = useRef(false);

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        void fetchOrdenes(0);
    }, [fetchOrdenes]);

    const cargarDetalle = useCallback(
        async (ordenId: number): Promise<OrderActionResult<OrderApi>> => {
            const local = obtenerDetalleLocal(ordenId);
            if (local) {
                rememberDetalle(local);
                return { success: true, data: local };
            }

            setDetailLoading(true);
            setError(null);
            try {
                const data = await orderApi.obtenerOrden(ordenId);
                rememberDetalle(data);
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
        [handleAuthError, obtenerDetalleLocal, rememberDetalle]
    );

    const cerrarDetalle = useCallback(() => {
        setOrdenSeleccionada(null);
    }, []);

    const cancelarOrden = useCallback(
        async (ordenId: number): Promise<OrderActionResult<OrderApi>> => {
            try {
                const data = await orderApi.cancelarOrden(ordenId);
                rememberDetalle(data);
                await fetchOrdenes(page);
                return { success: true, data };
            } catch (err) {
                if (handleAuthError(toErrorStatus(err))) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: toErrorMessage(err) };
            }
        },
        [fetchOrdenes, page, handleAuthError, rememberDetalle]
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
        obtenerDetalleLocal,
        rememberDetalle,
    };
}
