import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api';
import type { UpdateProductPayload } from '../api/productApi';
import type {
    CreateProductRequest,
    ProductAdminApi,
    ProductApi,
    ProductImagesMutationResult,
    ProductMutationResult,
    ProductStatus,
} from './types';
import type { ProductImageApi } from './schemas/api';
import { useAuth } from '@/app/providers';

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Error desconocido';
}

export function useProducts() {
    const [productos, setProductos] = useState<ProductApi[]>([]);
    const [productosOcultos, setProductosOcultos] = useState<ProductAdminApi[]>([]);
    const [productosDescontinuados, setProductosDescontinuados] = useState<ProductAdminApi[]>([]);
    const [loading, setLoading] = useState(true);

    const { userRol } = useAuth();

    const reloadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const listaPublica = await productApi.getAll();
            setProductos(listaPublica);

            if (userRol === 'ROLE_ADMIN') {
                const [ocultos, descontinuados] = await Promise.all([
                    productApi.getAdmin('OCULTO'),
                    productApi.getAdmin('DESCONTINUADO'),
                ]);
                if (ocultos) setProductosOcultos(ocultos);
                if (descontinuados) setProductosDescontinuados(descontinuados);
            } else {
                setProductosOcultos([]);
                setProductosDescontinuados([]);
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            setProductos([]);
        } finally {
            setLoading(false);
        }
    }, [userRol]);

    useEffect(() => {
        void reloadProducts();
    }, [reloadProducts]);

    const createProduct = async (producto: CreateProductRequest): Promise<ProductApi> => {
        try {
            const nuevo = await productApi.create(producto);
            setProductos((prev) => [...prev, nuevo]);
            return nuevo;
        } catch (error) {
            console.error('Error al crear:', error);
            throw error;
        }
    };

    const updateProduct = async (
        id: number,
        data: UpdateProductPayload
    ): Promise<ProductMutationResult> => {
        try {
            await productApi.update(id, data);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar:', error);
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const deleteProduct = async (id: number): Promise<ProductMutationResult> => {
        try {
            await productApi.delete(id);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar:', error);
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const updateProductStatus = async (
        id: number,
        estado: ProductStatus
    ): Promise<ProductMutationResult> => {
        try {
            await productApi.updateStatus(id, estado);
            await reloadProducts();
            return { success: true };
        } catch (error) {
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const addProductImages = async (
        id: number,
        urls: string[]
    ): Promise<ProductImagesMutationResult> => {
        try {
            const data = await productApi.addImages(id, urls);
            await reloadProducts();
            return { success: true, data };
        } catch (error) {
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const deleteProductImage = async (
        productId: number,
        imageId: number
    ): Promise<ProductMutationResult> => {
        try {
            await productApi.deleteImage(productId, imageId);
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const changeMainImage = async (
        productId: number,
        imageId: number
    ): Promise<ProductMutationResult> => {
        try {
            await productApi.setMainImage(productId, imageId);
            return { success: true };
        } catch (error) {
            console.error('Error al cambiar imagen principal:', error);
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const getProductImages = async (productId: number): Promise<ProductImageApi[]> => {
        return productApi.getImages(productId);
    };

    const getProductById = async (id: number): Promise<ProductApi> => {
        return productApi.getById(id);
    };

    const getProductByIdAdmin = async (id: number): Promise<ProductAdminApi> => {
        return productApi.getByIdAdmin(id);
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
        reloadProducts,
    };
}
