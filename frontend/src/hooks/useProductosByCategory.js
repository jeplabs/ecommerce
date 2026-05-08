import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCategorias } from '../context/CategoriasContext'; // Para encontrar el ID por slug

// Función auxiliar recursiva para encontrar el ID de una categoría a partir de una ruta jerárquica
const encontrarCategoriaPorRuta = (arbol, segmentos) => {
    if (!segmentos || segmentos.length === 0) return null;
    const [slugActual, ...rest] = segmentos;
    const categoria = arbol.find(c => c.slug === slugActual || c.id?.toString() === slugActual);
    if (!categoria) return null;
    if (rest.length === 0) return categoria;
    return encontrarCategoriaPorRuta(categoria.subcategorias || [], rest);
};

export const useProductosByCategory = (categoriaSlugPath) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1); // Asume que tu API devuelve esto o lo calculas
    
    // Obtenemos el árbol para poder traducir slug -> ID
    const { arbolCategorias } = useCategorias();

    useEffect(() => {
        if (!categoriaSlugPath) {
            setProductos([]);
            setLoading(false);
            return;
        }

        if (!arbolCategorias || arbolCategorias.length === 0) {
            setLoading(true);
            return;
        }

        const segmentos = categoriaSlugPath.split('/').filter(Boolean);
        const categoria = encontrarCategoriaPorRuta(arbolCategorias, segmentos);
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
                // Restamos 1 para enviar la página correcta al backend (0-based)
                const paginaParaBackend = paginaActual - 1;
                
                // Ajusta 'page' y 'limit' según lo que espere tu backend
                // Si tu backend no devuelve metadatos de paginación, quizás solo recibas un array
                const data = await productService.getByCategory(categoriaId, paginaParaBackend, 10);
                // console.log('🔍 DATOS CRUDOS DE LA API:', data);

                // 1. Los productos están en data.content
                // 2. La paginación está en data.page
                if (data.content && Array.isArray(data.content)) {
                    setProductos(data.content);
                    setTotalPaginas(data.page?.totalPages || 1);
                } 
                // Fallback por si la API cambia o devuelve array directo
                else if (Array.isArray(data)) {
                    setProductos(data);
                    setTotalPaginas(1);
                }
                else {
                    console.warn('Estructura de respuesta inesperada:', data);
                    setProductos([]);
                    setTotalPaginas(1);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error cargando productos por categoría:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [categoriaSlugPath, paginaActual, arbolCategorias]); 

    return { productos, loading, error, paginaActual, setPaginaActual, totalPaginas };
};