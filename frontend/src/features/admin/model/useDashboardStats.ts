import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/entities/user/api';
import { orderApi } from '@/entities/order/api';
import { productApi } from '@/entities/product/api';
import type { OrderApi, OrderStatus } from '@/entities/order';
import { redirectUnauthorized } from '@/shared/lib/http-session';
import { ApiError } from '@/shared';
import type { DashboardStats } from './types';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

export function useDashboardStats(): DashboardStats {
    const navigate = useNavigate();

    const [totalUsuarios, setTotalUsuarios] = useState(0);
    const [usuariosActivos, setUsuariosActivos] = useState(0);
    const [productosDisponibles, setProductosDisponibles] = useState(0);
    const [productosOcultos, setProductosOcultos] = useState(0);
    const [totalOrdenes, setTotalOrdenes] = useState(0);
    const [ordenesPorEstado, setOrdenesPorEstado] = useState<Record<OrderStatus, number>>({
        PENDIENTE: 0,
        CONFIRMADA: 0,
        EN_PROCESO: 0,
        ENVIADA: 0,
        ENTREGADA: 0,
        CANCELADA: 0,
    });
    const [revenueTotal, setRevenueTotal] = useState(0);
    const [ticketPromedio, setTicketPromedio] = useState(0);
    const [ultimasOrdenes, setUltimasOrdenes] = useState<OrderApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!localStorage.getItem('token')) {
            navigate('/login', { replace: true });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                usuarios,
                ordenesPage,
                estadoPendiente,
                estadoConfirmada,
                estadoEnProceso,
                estadoEnviada,
                estadoEntregada,
                estadoCancelada,
                prodsDisponibles,
                prodsOcultos,
            ] = await Promise.all([
                authApi.listUsuarios(),
                orderApi.listarOrdenesAdmin({ page: 0, size: 100 }),
                orderApi.listarOrdenesAdmin({ page: 0, size: 1, estado: 'PENDIENTE' }),
                orderApi.listarOrdenesAdmin({ page: 0, size: 1, estado: 'CONFIRMADA' }),
                orderApi.listarOrdenesAdmin({ page: 0, size: 1, estado: 'EN_PROCESO' }),
                orderApi.listarOrdenesAdmin({ page: 0, size: 1, estado: 'ENVIADA' }),
                orderApi.listarOrdenesAdmin({ page: 0, size: 1, estado: 'ENTREGADA' }),
                orderApi.listarOrdenesAdmin({ page: 0, size: 1, estado: 'CANCELADA' }),
                productApi.getAdmin('DISPONIBLE'),
                productApi.getAdmin('OCULTO'),
            ]);

            const todasLasOrdenes = ordenesPage.content || [];

            setTotalUsuarios(usuarios.length);
            setUsuariosActivos(usuarios.filter((u) => u.activo).length);

            setProductosDisponibles(prodsDisponibles?.length ?? 0);
            setProductosOcultos(prodsOcultos?.length ?? 0);

            setTotalOrdenes(ordenesPage.totalElements ?? 0);
            setOrdenesPorEstado({
                PENDIENTE: estadoPendiente?.totalElements ?? 0,
                CONFIRMADA: estadoConfirmada?.totalElements ?? 0,
                EN_PROCESO: estadoEnProceso?.totalElements ?? 0,
                ENVIADA: estadoEnviada?.totalElements ?? 0,
                ENTREGADA: estadoEntregada?.totalElements ?? 0,
                CANCELADA: estadoCancelada?.totalElements ?? 0,
            });

            const revenue = todasLasOrdenes.reduce((sum, o) => sum + (o.total || 0), 0);
            setRevenueTotal(revenue);
            setTicketPromedio(
                todasLasOrdenes.length > 0 ? revenue / todasLasOrdenes.length : 0
            );

            setUltimasOrdenes(todasLasOrdenes.slice(0, 5));
        } catch (err) {
            if (redirectUnauthorized(toErrorStatus(err), navigate)) {
                return;
            }
            console.error('Error al cargar estadísticas del dashboard', err);
            setError(toErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        void fetchStats();
    }, [fetchStats]);

    return {
        totalUsuarios,
        usuariosActivos,
        productosDisponibles,
        productosOcultos,
        totalOrdenes,
        ordenesPorEstado,
        revenueTotal,
        ticketPromedio,
        ultimasOrdenes,
        loading,
        error,
    };
}
