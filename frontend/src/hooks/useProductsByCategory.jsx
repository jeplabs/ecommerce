// src/hooks/useProductsByCategory.js
import { useState, useEffect } from 'react';
import { getProductsByCategoryId } from '../services/productService'; // Importa la función de arriba

export const useProductsByCategory = (categoryId) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!categoryId) {
            setProductos([]);
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getProductsByCategoryId(categoryId);
                setProductos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId]); // Se ejecuta cada vez que cambia el ID de la categoría

    return { productos, loading, error };
};