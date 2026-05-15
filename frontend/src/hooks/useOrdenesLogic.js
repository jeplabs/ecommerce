import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenService } from '../services/ordenService';
import { isAuthError } from '../utils/apiHelpers';

const PAGE_SIZE = 10;

export const useOrdenesLogic = () => {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    const [error, setError] = useState(null);

    const handleAuthError = useCallback(
        (status) => {
            if (isAuthError(status)) {
                localStorage.removeItem('token');
                navigate('/login', { replace: true });
                return true;
            }
            return false;
        },
        [navigate]
    );

    const fetchOrdenes = useCallback(
        async (pageNum = 0) => {
            setLoading(true);
            setError(null);
            try {
                const data = await ordenService.listarMisOrdenes(pageNum, PAGE_SIZE);
                setOrdenes(data.content || []);
                setPage(data.number ?? pageNum);
                setTotalPages(data.totalPages ?? 0);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                if (handleAuthError(err.status)) return;
                setError(err.message);
                setOrdenes([]);
            } finally {
                setLoading(false);
            }
        },
        [handleAuthError]
    );

    const cargarDetalle = useCallback(
        async (ordenId) => {
            setDetailLoading(true);
            setError(null);
            try {
                const data = await ordenService.obtenerOrden(ordenId);
                setOrdenSeleccionada(data);
                return { success: true, data };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                setError(err.message);
                return { success: false, error: err.message };
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
        async (ordenId) => {
            try {
                const data = await ordenService.cancelarOrden(ordenId);
                setOrdenSeleccionada(data);
                await fetchOrdenes(page);
                return { success: true };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                return { success: false, error: err.message };
            }
        },
        [fetchOrdenes, page, handleAuthError]
    );

    const irAPagina = useCallback(
        (nuevaPagina) => {
            if (nuevaPagina < 0 || nuevaPagina >= totalPages) return;
            fetchOrdenes(nuevaPagina);
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
};
