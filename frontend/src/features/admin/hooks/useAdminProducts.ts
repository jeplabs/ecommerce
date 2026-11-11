import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    productsAdminApi,
    type ProductAdminApi,
    type ProductMutationResult,
} from '@/features/catalog';
import { ApiError, getAccessToken, redirectUnauthorized } from '@/lib';
import type { AdminProductStatusFilter, UseAdminProductsResult } from '../types';

const DEFAULT_PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 250;

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error al cargar productos';
}

function toErrorStatus(error: unknown): number | undefined {
    return error instanceof ApiError ? error.status : undefined;
}

/**
 * Listado paginado de productos en servidor (/api/productos/admin),
 * con filtros por búsqueda (nombre/SKU), categoría y estado, sin límite de 100 registros.
 */
export function useAdminProducts(
    initialPageSize = DEFAULT_PAGE_SIZE
): UseAdminProductsResult {
    const navigate = useNavigate();

    const [productos, setProductos] = useState<ProductAdminApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPageState] = useState(1);
    const [pageSize, setPageSizeState] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const [searchQuery, setSearchQueryState] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoriaId, setCategoriaIdState] = useState<number | ''>('');
    const [estadoFiltro, setEstadoFiltroState] = useState<AdminProductStatusFilter>('');

    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setDebouncedSearch('');
            return;
        }
        const timer = window.setTimeout(() => {
            setDebouncedSearch(trimmed);
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchQuery]);

    const fetchProducts = useCallback(async () => {
        const token =
            getAccessToken() ||
            (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const pageData = await productsAdminApi.getAdminPage({
                nombre: debouncedSearch || undefined,
                categoriaId: categoriaId === '' ? undefined : categoriaId,
                estado: estadoFiltro || undefined,
                page: Math.max(0, page - 1),
                size: pageSize,
            });

            const nextTotalPages = Math.max(1, pageData.totalPages ?? 1);
            setProductos(pageData.content || []);
            setTotalElements(pageData.totalElements ?? 0);
            setTotalPages(nextTotalPages);

            if (page > nextTotalPages) {
                setPageState(nextTotalPages);
            }
        } catch (err) {
            if (redirectUnauthorized(toErrorStatus(err), navigate)) {
                return;
            }
            console.error('Error al cargar productos admin:', err);
            setError(toErrorMessage(err));
            setProductos([]);
            setTotalElements(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [categoriaId, debouncedSearch, estadoFiltro, navigate, page, pageSize]);

    useEffect(() => {
        void fetchProducts();
    }, [fetchProducts]);

    const setSearchQuery = useCallback((value: string) => {
        setSearchQueryState(value);
        setPageState(1);
    }, []);

    const setCategoriaId = useCallback((value: number | '') => {
        setCategoriaIdState(value);
        setPageState(1);
    }, []);

    const setEstadoFiltro = useCallback((value: AdminProductStatusFilter) => {
        setEstadoFiltroState(value);
        setPageState(1);
    }, []);

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size);
        setPageState(1);
    }, []);

    const setPage = useCallback(
        (nextPage: number) => {
            const clamped = Math.min(Math.max(1, nextPage), Math.max(1, totalPages));
            setPageState(clamped);
        },
        [totalPages]
    );

    const hasActiveFilters =
        searchQuery.trim() !== '' || categoriaId !== '' || estadoFiltro !== '';

    const clearFilters = useCallback(() => {
        setSearchQueryState('');
        setDebouncedSearch('');
        setCategoriaIdState('');
        setEstadoFiltroState('');
        setPageState(1);
    }, []);

    const deleteProduct = useCallback(
        async (id: number): Promise<ProductMutationResult> => {
            try {
                await productsAdminApi.deleteProduct(id);
                await fetchProducts();
                return { success: true };
            } catch (err) {
                return { success: false, message: toErrorMessage(err) };
            }
        },
        [fetchProducts]
    );

    return {
        productos,
        loading,
        error,
        page,
        pageSize,
        totalPages,
        totalElements,
        searchQuery,
        setSearchQuery,
        categoriaId,
        setCategoriaId,
        estadoFiltro,
        setEstadoFiltro,
        setPage,
        setPageSize,
        hasActiveFilters,
        clearFilters,
        refetch: fetchProducts,
        deleteProduct,
    };
}
