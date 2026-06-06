import { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../api';
import type { CategoryApi } from './schemas/api';
import type { CreateCategoryRequest } from './schemas/forms';

export function useCategorias() {
    const [arbolCategorias, setArbolCategorias] = useState<CategoryApi[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            setLoading(true);
            try {
                const data = await categoryApi.getAll();
                setArbolCategorias(data);
            } catch (error) {
                console.error('Error general al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };
        void fetchCategorias();
    }, []);

    const createCategory = useCallback(async (categoriaDatos: CreateCategoryRequest) => {
        setLoading(true);
        try {
            const nuevaCategoria = await categoryApi.create(categoriaDatos);
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
    };
}
