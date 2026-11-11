import type { Dispatch, SetStateAction } from 'react';
import type { OrderApi, OrderStatus } from '@/features/checkout';
import type { UserApi, UserRole } from '@/features/auth';
import type {
    ProductAdminApi,
    ProductMutationResult,
    ProductStatus,
} from '@/features/catalog';

export type DashboardStats = {
    totalUsuarios: number;
    usuariosActivos: number;
    productosDisponibles: number;
    productosOcultos: number;
    totalOrdenes: number;
    ordenesPorEstado: Record<OrderStatus, number>;
    revenueTotal: number;
    ticketPromedio: number;
    ultimasOrdenes: OrderApi[];
    loading: boolean;
    error: string | null;
};

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

export type AdminProductStatusFilter = '' | ProductStatus;

export type UseAdminProductsResult = {
    productos: ProductAdminApi[];
    loading: boolean;
    error: string | null;
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    categoriaId: number | '';
    setCategoriaId: (value: number | '') => void;
    estadoFiltro: AdminProductStatusFilter;
    setEstadoFiltro: (value: AdminProductStatusFilter) => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
    refetch: () => Promise<void>;
    deleteProduct: (id: number) => Promise<ProductMutationResult>;
};
