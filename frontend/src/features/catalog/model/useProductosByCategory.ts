import { useState, useEffect } from 'react';
import { productApi } from '@/entities/product/api';
import type { ProductApi } from '@/entities/product';
import { useCategorias } from '@/app/providers';
import { findCategoryByPath } from '../lib/category-path';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

export function useProductosByCategory(categoriaSlugPath: string) {
    const [productos, setProductos] = useState<ProductApi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const { arbolCategorias } = useCategorias();

    useEffect(() => {
        if (!categoriaSlugPath) {
            setProductos([]);
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
                const paginaParaBackend = paginaActual - 1;
                const data = await productApi.getByCategory(
                    categoriaId,
                    paginaParaBackend,
                    10
                );

                if (data?.content && Array.isArray(data.content)) {
                    setProductos(data.content);
                    setTotalPaginas(data.totalPages ?? 1);
                } else if (Array.isArray(data)) {
                    setProductos(data as ProductApi[]);
                    setTotalPaginas(1);
                } else {
                    console.warn('Estructura de respuesta inesperada:', data);
                    setProductos([]);
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
    }, [categoriaSlugPath, paginaActual, arbolCategorias]);

    return {
        productos,
        loading,
        error,
        paginaActual,
        setPaginaActual,
        totalPaginas,
    };
}
