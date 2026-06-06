import type { Dispatch, SetStateAction } from 'react';
import type { OrderApi, OrderStatus } from '@/entities/order';
import type { UserApi, UserRole } from '@/entities/user';

export type AdminOrderStatusFilter = '' | OrderStatus;

export type AdminActionResult<T = void> =
    | { success: true; data?: T }
    | { success: false; error: string };

export type UseAdminOrdersLogicResult = {
    ordenes: OrderApi[];
    page: number;
    totalPages: number;
    totalElements: number;
    loading: boolean;
    estadoFiltro: AdminOrderStatusFilter;
    setEstadoFiltro: (valor: AdminOrderStatusFilter) => void;
    error: string | null;
    updatingId: number | null;
    irAPagina: (nuevaPagina: number) => void;
    updateEstadoOrden: (
        ordenId: number,
        nuevoEstado: OrderStatus
    ) => Promise<AdminActionResult<OrderApi>>;
    refetch: () => void;
    detailModalOpen: boolean;
    ordenDetalle: OrderApi | null;
    detailLoading: boolean;
    abrirDetalle: (ordenId: number) => Promise<AdminActionResult<OrderApi>>;
    cerrarDetalle: () => void;
};

export type UseAdminUsersListResult = {
    users: UserApi[];
    setUsers: Dispatch<SetStateAction<UserApi[]>>;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
};

export type UseAdminUserResult = {
    user: UserApi | null;
    rol: UserRole | '';
    setRol: Dispatch<SetStateAction<UserRole | ''>>;
    loading: boolean;
    saving: boolean;
    updateRol: (nextRol: UserRole) => Promise<AdminActionResult<UserApi>>;
};
