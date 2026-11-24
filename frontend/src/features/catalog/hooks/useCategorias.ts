import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../api';
import type { CategoryApi, CreateCategoryRequest } from '../types';

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

    const createCategory = useCallback(
        async (categoriaDatos: CreateCategoryRequest) => {
            setLoading(true);
            try {
                const nuevaCategoria = await categoryApi.create(categoriaDatos);
                await reloadCategorias();
                return nuevaCategoria;
            } catch (error) {
                console.error('Error al crear la categoría:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [reloadCategorias]
    );

    const updateCategory = useCallback(
        async (id: number, categoriaDatos: CreateCategoryRequest) => {
            setLoading(true);
            try {
                const actualizada = await categoryApi.update(id, categoriaDatos);
                await reloadCategorias();
                return actualizada;
            } catch (error) {
                console.error('Error al actualizar la categoría:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [reloadCategorias]
    );

    const deleteCategory = useCallback(
        async (id: number) => {
            setLoading(true);
            try {
                await categoryApi.deleteCategory(id);
                await reloadCategorias();
            } catch (error) {
                console.error('Error al eliminar la categoría:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [reloadCategorias]
    );

    return {
        arbolCategorias,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
        reloadCategorias,
    };
}
