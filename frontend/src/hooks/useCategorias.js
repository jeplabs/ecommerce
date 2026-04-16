import { useState, useEffect } from 'react';
import { categoriasService } from '../services/categoriasService';

export const useCategorias = () => {
    const [arbolCategorias, setArbolCategorias] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            setLoading(true);
            try {
                const data = await categoriasService.getAll();
                setArbolCategorias(data);
            } catch (error) {
                console.error('Error general al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategorias();
    }, []);

    const createCategory = async (categoriaDatos) => {
        setLoading(true);
        try {
            const nuevaCategoria = await categoriasService.create(categoriaDatos);
            // Actualizar estado localmente sin recargar
            setArbolCategorias((prev) => [...prev, nuevaCategoria]);
            return nuevaCategoria;
        } catch (error) {
            console.error('Error al crear la categoria', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        arbolCategorias,
        loading,
        createCategory,
    };
};