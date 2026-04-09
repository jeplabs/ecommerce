import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { useAuth  } from '../context/AuthContext';

export const useProducts = () => {
    const [productos, setProductos] = useState([]);
    const [productosOcultos, setProductosOcultos] = useState([]);
    const [productosDescontinuados, setProductosDescontinuados] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Usamos el contexto de Auth solo para saber el rol
    const { userRol } = useAuth (); 

    // Función interna para recargar datos (igual que tu reloadProducts)
    const reloadProducts = async () => {
        setLoading(true);
        try {
            // 1. Cargar Públicos
            const listaPublica = await productService.getAll();
            setProductos(listaPublica);

            // 2. Cargar Admin (si corresponde)
            if (userRol === 'ROLE_ADMIN') {
                const [ocultos, descontinuados] = await Promise.all([
                    productService.getAdmin('OCULTO'),
                    productService.getAdmin('DESCONTINUADO')
                ]);
                if (ocultos) setProductosOcultos(ocultos);
                if (descontinuados) setProductosDescontinuados(descontinuados);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    };

    // Efecto inicial: Cargar al montar o cambiar el rol
    useEffect(() => {
        reloadProducts();
    }, [userRol]);

    // --- Funciones de Acción (CRUD) ---
    // Estas funciones envuelven al service y actualizan el estado localmente si es necesario

    const createProduct = async (producto) => {
        try {
            const nuevo = await productService.create(producto);
            setProductos(prev => [...prev, nuevo]);
            return nuevo;
        } catch (error) {
            console.error('Error al crear:', error);
            throw error;
        }
    };

    const updateProduct = async (id, data) => {
        try {
            await productService.update(id, data);
            // Recargar para tener datos frescos (o actualizar manualmente el estado)
            await reloadProducts(); 
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar:', error);
            return { success: false, message: error.message };
        }
    };

    const deleteProduct = async (id) => {
        try {
            await productService.delete(id);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar:', error);
            return { success: false, message: error.message };
        }
    };

    const updateProductStatus = async (id, estado) => {
        try {
            await productService.updateStatus(id, estado);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };
    
    const addProductImages = async (id, urls) => {
        try {
            await productService.addImages(id, urls);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const deleteProductImage = async (productId, imageId) => {
        try {
            await productService.deleteImage(productId, imageId);
            // Opcional: Recargar productos si quieres reflejar el cambio en la lista global inmediatamente
            // Pero en un formulario de edición, usualmente actualizas el estado local del formulario
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            return { success: false, message: error.message };
        }
    };

    const changeMainImage = async (productId, imageId) => {
        try {
            await productService.setMainImage(productId, imageId);
            return { success: true };
        } catch (error) {
            console.error('Error al cambiar imagen principal:', error);
            return { success: false, message: error.message };
        }
    };

    const getProductImages = async (productId) => {
        return await productService.getImages(productId);
    };

    // Hooks específicos para obtener un solo producto (útiles en páginas de detalle)
    const getProductById = async (id) => {
        return await productService.getById(id);
    };

    const getProductByIdAdmin = async (id) => {
        return await productService.getByIdAdmin(id);
    };

    return {
        productos,
        productosOcultos,
        productosDescontinuados,
        loading,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStatus,
        addProductImages,
        deleteProductImage,
        changeMainImage,
        getProductImages,
        getProductById,
        getProductByIdAdmin,
        reloadProducts
    };
};