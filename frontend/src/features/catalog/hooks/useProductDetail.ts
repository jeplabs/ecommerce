import { useState, useEffect, useCallback } from 'react';
import { useProduct } from '@/app/providers';
import { getBySlug, getById } from '../api/productsApi';
import type { ProductApi } from '../types';

export async function fetchProductBySlug(slug: string): Promise<ProductApi> {
    try {
        return await getBySlug(slug);
    } catch {
        const numericId = Number.parseInt(slug, 10);
        if (Number.isFinite(numericId) && String(numericId) === slug) {
            return getById(numericId);
        }
        throw new Error('Producto no encontrado');
    }
}

export function useProductDetail(slug: string) {
    const { upsertProduct } = useProduct();
    const [producto, setProducto] = useState<ProductApi | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProduct = useCallback(
        async (options?: { silent?: boolean }) => {
            if (!slug) {
                setProducto(null);
                setLoading(false);
                return;
            }

            if (!options?.silent) {
                setLoading(true);
            }

            try {
                const data = await fetchProductBySlug(slug);
                setProducto(data);
                upsertProduct(data);
            } catch {
                setProducto(null);
            } finally {
                setLoading(false);
            }
        },
        [slug, upsertProduct]
    );

    useEffect(() => {
        void loadProduct();
    }, [loadProduct]);

    useEffect(() => {
        const refreshOnVisible = () => {
            if (document.visibilityState === 'visible') {
                void loadProduct({ silent: true });
            }
        };

        document.addEventListener('visibilitychange', refreshOnVisible);
        return () => document.removeEventListener('visibilitychange', refreshOnVisible);
    }, [loadProduct]);

    return {
        producto,
        loading,
        reload: loadProduct,
    };
}
