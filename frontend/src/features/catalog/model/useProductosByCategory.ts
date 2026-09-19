import { useState, useEffect } from 'react';
import { productApi } from '@/entities/product/api';
import type { ProductApi } from '@/entities/product';
import type { SpecFacetOption } from '../model/types';
import { useCategorias } from '@/app/providers';
import { findCategoryByPath } from '../lib/category-path';

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

    const { arbolCategorias } = useCategorias();

    const searchParamsString = searchParams?.toString() ?? '';

    useEffect(() => {
        if (!categoriaSlugPath) {
            setProductos([]);
            setFacets(undefined);
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
                const queryParams = new URLSearchParams(searchParamsString);
                queryParams.set('categoriaId', String(categoriaId));

                const rawPage = queryParams.get('page');
                const pageNum = rawPage ? Math.max(1, Number(rawPage)) : 1;
                setPaginaActual(pageNum);
                queryParams.set('page', String(pageNum - 1));
                if (!queryParams.has('size')) {
                    queryParams.set('size', '12');
                }

                const data = await productApi.getCatalogo(queryParams);

                if (data?.content && Array.isArray(data.content)) {
                    setProductos(data.content);
                    setFacets(data.facets as Record<string, SpecFacetOption[]> | undefined);
                    setTotalPaginas(data.totalPages ?? 1);
                } else if (Array.isArray(data)) {
                    setProductos(data as ProductApi[]);
                    setFacets(undefined);
                    setTotalPaginas(1);
                } else {
                    console.warn('Estructura de respuesta inesperada:', data);
                    setProductos([]);
                    setFacets(undefined);
                    setTotalPaginas(1);
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
    };
}
