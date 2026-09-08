import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../api';
import type { CategoryApi } from './schemas/api';
import type { CreateCategoryRequest } from './schemas/forms';

let cachedCategories: CategoryApi[] | null = null;
let categoriesFetchPromise: Promise<CategoryApi[]> | null = null;

async function getOrFetchCategories(): Promise<CategoryApi[]> {
    if (cachedCategories && cachedCategories.length > 0) return cachedCategories;
    if (!categoriesFetchPromise) {
        categoriesFetchPromise = categoryApi
            .getAll()
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    cachedCategories = data;
                }
                return data;
            })
            .finally(() => {
                categoriesFetchPromise = null;
            });
    }
    return categoriesFetchPromise;
}

export function useCategorias() {
    const hasCachedCategories = Boolean(cachedCategories && cachedCategories.length > 0);
    const [arbolCategorias, setArbolCategorias] = useState<CategoryApi[]>(
        cachedCategories || []
    );
    const [loading, setLoading] = useState(!hasCachedCategories);

    const reloadCategorias = useCallback(async () => {
        cachedCategories = null;
        setLoading(true);
        try {
            const data = await getOrFetchCategories();
            setArbolCategorias(data);
            return data;
        } catch (error) {
            console.error('Error al recargar categorías:', error);
            setArbolCategorias([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchCategorias = async () => {
            if (!cachedCategories || cachedCategories.length === 0) {
                setLoading(true);
            }
            try {
                const data = await getOrFetchCategories();
                if (isMounted) setArbolCategorias(data);
            } catch (error) {
                console.error('Error general al cargar datos:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        void fetchCategorias();
        return () => {
            isMounted = false;
        };
    }, []);

    const createCategory = useCallback(async (categoriaDatos: CreateCategoryRequest) => {
        setLoading(true);
        try {
            const nuevaCategoria = await categoryApi.create(categoriaDatos);
            cachedCategories = [...(cachedCategories || []), nuevaCategoria];
            setArbolCategorias((prev) => [...prev, nuevaCategoria]);
            return nuevaCategoria;
        } catch (error) {
            console.error('Error al crear la categoria', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        arbolCategorias,
        loading,
        createCategory,
        reloadCategorias,
    };
}
