import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordenService } from '../services/ordenService';
import { redirectUnauthorized } from '../utils/apiHelpers';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 10;

/**
 * Listado paginado de órdenes (admin), filtro por estado y actualización de estado.
 */
export function useAdminOrdersLogic() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [ordenes, setOrdenes] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [estadoFiltro, setEstadoFiltroState] = useState('');
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [ordenDetalle, setOrdenDetalle] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const handleAuthError = useCallback(
        (status) => redirectUnauthorized(status, navigate),
        [navigate]
    );

    const setEstadoFiltro = useCallback((valor) => {
        setEstadoFiltroState(valor);
        setPage(0);
    }, []);

    const fetchPage = useCallback(
        async (pageNum) => {
            if (!localStorage.getItem('token')) {
                navigate('/login', { replace: true });
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await ordenService.listarOrdenesAdmin({
                    page: pageNum,
                    size: PAGE_SIZE,
                    estado: estadoFiltro || undefined,
                });
                setOrdenes(data.content || []);
                setPage(data.number ?? pageNum);
                setTotalPages(data.totalPages ?? 0);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return;
                }
                console.error('Error al listar órdenes (admin)', err);
                setError(err.message);
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
        (nuevaPagina) => {
            if (nuevaPagina < 0 || nuevaPagina >= totalPages) return;
            setPage(nuevaPagina);
        },
        [totalPages]
    );

    const updateEstadoOrden = useCallback(
        async (ordenId, nuevoEstado) => {
            setUpdatingId(ordenId);
            try {
                const updated = await ordenService.actualizarEstadoOrdenAdmin(ordenId, nuevoEstado);
                setOrdenes((prev) => prev.map((o) => (o.id === ordenId ? updated : o)));
                if (ordenDetalle?.id === ordenId) {
                    setOrdenDetalle(updated);
                }
                showSuccess('Estado del pedido actualizado');
                return { success: true, data: updated };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false, error: 'Sesión expirada' };
                }
                showError(err.message);
                return { success: false, error: err.message };
            } finally {
                setUpdatingId(null);
            }
        },
        [handleAuthError, showSuccess, showError, ordenDetalle?.id]
    );

    const abrirDetalle = useCallback(
        async (ordenId) => {
            setDetailModalOpen(true);
            setOrdenDetalle(null);
            setDetailLoading(true);
            try {
                const data = await ordenService.obtenerOrdenAdmin(ordenId);
                setOrdenDetalle(data);
                return { success: true, data };
            } catch (err) {
                if (handleAuthError(err.status)) {
                    return { success: false };
                }
                showError(err.message);
                setDetailModalOpen(false);
                return { success: false, error: err.message };
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
