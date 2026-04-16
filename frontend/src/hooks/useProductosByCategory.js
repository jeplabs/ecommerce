import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useCategorias } from '../context/CategoriasContext'; // Para encontrar el ID por slug

// Función auxiliar recursiva para encontrar el ID basado en el slug
const encontrarIdPorSlug = (arbol, slugBuscado) => {
    for (const categoria of arbol) {
        if (categoria.slug === slugBuscado) {
            return categoria.id;
        }
        if (categoria.subcategorias && categoria.subcategorias.length > 0) {
            const encontrado = encontrarIdPorSlug(categoria.subcategorias, slugBuscado);
            if (encontrado) return encontrado;
        }
    }
    return null;
};

export const useProductosByCategory = (categoriaId) => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1); // Asume que tu API devuelve esto o lo calculas
    
    // Obtenemos el árbol para poder traducir slug -> ID
    const { arbolCategorias } = useCategorias();

    useEffect(() => {
        if (!categoriaId) {
            setProductos([]);
            setLoading(false);
            return;
        }

        // if (!slug || !arbolCategorias.length) {
        //     setProductos([]);
        //     setLoading(false);
        //     return;
        // }

        // // 1. Traducir slug a ID
        // const categoriaId = encontrarIdPorSlug(arbolCategorias, slug);

        // if (!categoriaId) {
        //     setError('Categoría no encontrada');
        //     setLoading(false);
        //     return;
        // }

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
    // }, [slug, paginaActual, arbolCategorias]);
    }, [categoriaId, paginaActual]); 

    return { productos, loading, error, paginaActual, setPaginaActual, totalPaginas };
};