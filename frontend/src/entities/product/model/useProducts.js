import { useState, useEffect } from 'react';
import { productApi } from '@/entities/product';
import { useAuth } from '@/app/providers/AuthProvider';

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
            const listaPublica = await productApi.getAll();
            setProductos(listaPublica);

            // 2. Cargar Admin (si corresponde)
            if (userRol === 'ROLE_ADMIN') {
                const [ocultos, descontinuados] = await Promise.all([
                    productApi.getAdmin('OCULTO'),
                    productApi.getAdmin('DESCONTINUADO')
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
            const nuevo = await productApi.create(producto);
            setProductos(prev => [...prev, nuevo]);
            return nuevo;
        } catch (error) {
            console.error('Error al crear:', error);
            throw error;
        }
    };

    const updateProduct = async (id, data) => {
        try {
            await productApi.update(id, data);
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
            await productApi.delete(id);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar:', error);
            return { success: false, message: error.message };
        }
    };

    const updateProductStatus = async (id, estado) => {
        try {
            await productApi.updateStatus(id, estado);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };
    
    const addProductImages = async (id, urls) => {
        try {
            //await productApi.addImages(id, urls);
            const data = await productApi.addImages(id, urls);
            await reloadProducts();
            //return { success: true };
            return { success: true, data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const deleteProductImage = async (productId, imageId) => {
        try {
            await productApi.deleteImage(productId, imageId);
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
            await productApi.setMainImage(productId, imageId);
            return { success: true };
        } catch (error) {
            console.error('Error al cambiar imagen principal:', error);
            return { success: false, message: error.message };
        }
    };

    const getProductImages = async (productId) => {
        return await productApi.getImages(productId);
    };

    // Hooks específicos para obtener un solo producto (útiles en páginas de detalle)
    const getProductById = async (id) => {
        return await productApi.getById(id);
    };

    const getProductByIdAdmin = async (id) => {
        return await productApi.getByIdAdmin(id);
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