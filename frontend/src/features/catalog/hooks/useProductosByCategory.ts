import { useState, useEffect } from 'react';
import { getCatalogo } from '../api/catalogApi';
import type { ProductApi, SpecFacetOption } from '../types';
import { useCategorias } from '@/app/providers';
import { findCategoryByPath } from '../lib/category-path';
import { toCatalogApiSearchParams } from '../lib/catalog-query-params';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

export function useProductosByCategory(categoriaSlugPath: string, searchParams?: URLSearchParams) {
    const [productos, setProductos] = useState<ProductApi[]>([]);
    const [facets, setFacets] = useState<Record<string, SpecFacetOption[]> | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalElementos, setTotalElementos] = useState(0);

    const { arbolCategorias } = useCategorias();

    const searchParamsString = searchParams?.toString() ?? '';

    useEffect(() => {
        if (!categoriaSlugPath) {
            setProductos([]);
            setFacets(undefined);
            setTotalElementos(0);
            setLoading(false);
            return;
        }

        if (!arbolCategorias?.length) {
            setLoading(true);
            return;
        }

        const segmentos = categoriaSlugPath.split('/').filter(Boolean);
        const categoria = findCategoryByPath(arbolCategorias, segmentos);
        if (!categoria) {
            setError('Categoría no encontrada');
            setLoading(false);
            return;
        }
        const categoriaId = categoria.id;

        const fetchProductos = async () => {
            setLoading(true);
            setError(null);
            try {
                const searchParamsObj = new URLSearchParams(searchParamsString);
                const rawPage = searchParamsObj.get('page');
                const pageNum = rawPage ? Math.max(1, Number(rawPage)) : 1;
                setPaginaActual(pageNum);

                const queryParams = toCatalogApiSearchParams(searchParamsObj);
                queryParams.set('categoriaId', String(categoriaId));

                const data = await getCatalogo(queryParams);

                if (data?.content && Array.isArray(data.content)) {
                    setProductos(data.content);
                    setFacets(data.facets as Record<string, SpecFacetOption[]> | undefined);
                    setTotalPaginas(data.totalPages ?? 1);
                    setTotalElementos(data.totalElements ?? data.content.length);
                } else if (Array.isArray(data)) {
                    setProductos(data as ProductApi[]);
                    setFacets(undefined);
                    setTotalPaginas(1);
                    setTotalElementos((data as ProductApi[]).length);
                } else {
                    console.warn('Estructura de respuesta inesperada:', data);
                    setProductos([]);
                    setFacets(undefined);
                    setTotalPaginas(1);
                    setTotalElementos(0);
                }
            } catch (err) {
                setError(toErrorMessage(err));
                console.error('Error cargando productos por categoría:', err);
            } finally {
                setLoading(false);
            }
        };

        void fetchProductos();
    }, [categoriaSlugPath, searchParamsString, arbolCategorias]);

    return {
        productos,
        facets,
        loading,
        error,
        paginaActual,
        setPaginaActual,
        totalPaginas,
        totalElementos,
    };
}
