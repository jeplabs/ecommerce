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

let cachedProducts: ProductApi[] | null = null;
let productsFetchPromise: Promise<ProductApi[]> | null = null;

async function getOrFetchProducts(forceFresh = false): Promise<ProductApi[]> {
    if (forceFresh) {
        cachedProducts = null;
    }
    if (cachedProducts) return cachedProducts;
    if (!productsFetchPromise) {
        productsFetchPromise = productApi.getAll()
            .then((data) => {
                cachedProducts = data;
                return data;
            })
            .finally(() => {
                productsFetchPromise = null;
            });
    }
    return productsFetchPromise;
}

export function useProducts() {
    const [productos, setProductos] = useState<ProductApi[]>(cachedProducts || []);
    const [productosOcultos, setProductosOcultos] = useState<ProductAdminApi[]>([]);
    const [productosDescontinuados, setProductosDescontinuados] = useState<ProductAdminApi[]>([]);
    const [loading, setLoading] = useState(!cachedProducts);

    const { userRol } = useAuth();

    const reloadProducts = useCallback(async (forceFresh = false) => {
        if (!cachedProducts || forceFresh) {
            setLoading(true);
        }
        try {
            const listaPublica = await getOrFetchProducts(forceFresh);
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
        let isMounted = true;
        void reloadProducts().then(() => {
            if (!isMounted) return;
        });
        return () => {
            isMounted = false;
        };
    }, [reloadProducts]);

    const createProduct = async (producto: CreateProductRequest): Promise<ProductApi> => {
        try {
            const nuevo = await productApi.create(producto);
            await reloadProducts(true);
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
            await reloadProducts(true);
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar:', error);
            return { success: false, message: toErrorMessage(error) };
        }
    };

    const deleteProduct = async (id: number): Promise<ProductMutationResult> => {
        try {
            await productApi.delete(id);
            await reloadProducts(true);
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
            await reloadProducts(true);
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
            await reloadProducts(true);
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

    const upsertProduct = useCallback((product: ProductApi) => {
        setProductos((prev) => {
            const index = prev.findIndex((item) => item.id === product.id);
            if (index === -1) {
                return [...prev, product];
            }
            const next = [...prev];
            next[index] = product;
            return next;
        });
    }, []);

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
        upsertProduct,
    };
}
