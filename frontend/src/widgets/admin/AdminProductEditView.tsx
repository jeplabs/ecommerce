import { useProduct, useCategorias, useToast } from '@/app/providers';
import { useState, useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ProductAdminApi, ProductApi, ProductStatus } from '@/entities/product';
import { ProductForm } from '@/features/admin/ui/ProductForm';
import type {
    ProductFormInitialData,
    ProductFormSubmitPayload,
} from '@/features/admin/ui/ProductForm';
import {
    getImageUrl,
    getInitialPrincipalBackendId,
    resolvePrincipalBackendId,
} from '@/features/admin';
import type {
    AdminAddedImageRef,
    AdminImageApiSource,
    AdminProductFormImage,
} from '@/features/admin/lib/product-image-admin';

type AdminProductEditViewProps = {
    productId: string | number;
    onNavigate: NavigateFunction;
};

function toNumericProductId(productId: string | number): number {
    return typeof productId === 'number' ? productId : Number(productId);
}

function mapLoadedProductToFormData(
    product: ProductApi | ProductAdminApi,
    images: AdminImageApiSource[]
): ProductFormInitialData {
    const categorias = 'categorias' in product ? product.categorias : [];
    const descripcion = 'descripcion' in product ? product.descripcion ?? '' : '';

    return {
        nombre: product.nombre,
        sku: product.sku,
        descripcion,
        price: String(product.precioVenta ?? ''),
        stock: String(product.stock ?? ''),
        estado: product.estado,
        moneda: product.moneda,
        categorias,
        images,
    };
}

export default function AdminProductEditView({ productId, onNavigate }: AdminProductEditViewProps) {
    const { arbolCategorias } = useCategorias();
    const {
        getProductById,
        getProductByIdAdmin,
        updateProduct,
        updateProductStatus,
        addProductImages,
        deleteProductImage,
        changeMainImage,
        getProductImages,
        reloadProducts,
        loading,
    } = useProduct();
    const { showSuccess, showError } = useToast();
    const [productData, setProductData] = useState<ProductFormInitialData | null>(null);
    const [storedImages, setStoredImages] = useState<AdminImageApiSource[]>([]);
    const [error, setError] = useState<string | null>(null);

    const numericProductId = toNumericProductId(productId);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const [adminRes, publicRes] = await Promise.allSettled([
                    getProductByIdAdmin(numericProductId),
                    getProductById(numericProductId),
                ]);

                const adminProduct = adminRes.status === 'fulfilled' ? adminRes.value : null;
                const publicProduct = publicRes.status === 'fulfilled' ? publicRes.value : null;
                const baseProduct = publicProduct || adminProduct;
                const imagesMeta = baseProduct ? await getProductImages(numericProductId) : [];
                const images = Array.isArray(imagesMeta) ? imagesMeta : [];

                if (baseProduct) {
                    setStoredImages(images);
                    setProductData(mapLoadedProductToFormData(baseProduct, images));
                } else {
                    setError('Producto no encontrado');
                }
            } catch (err) {
                setError('Error al cargar el producto');
                console.error('ProductEdit Error loading product:', err);
            }
        };

        if (productId) {
            void loadProduct();
        }
    }, [productId, numericProductId, getProductById, getProductByIdAdmin, getProductImages]);

    const handleUpdate = async (
        finalData: ProductFormSubmitPayload,
        formImages: AdminProductFormImage[] = []
    ) => {
        if (!productData) return;

        try {
            const initialPrincipalId = getInitialPrincipalBackendId(storedImages);

            const estadoNuevo = (finalData.estado as ProductStatus) || (productData.estado as ProductStatus);
            const resEstado = await updateProductStatus(numericProductId, estadoNuevo);
            if (!resEstado.success) {
                showError(`Error al actualizar el estado: ${resEstado.message}`);
                return;
            }

            const { estado: _estado, imagenesUrl, imagenesAEliminarIds, imagenPrincipalId, ...rest } =
                finalData;
            const result = await updateProduct(numericProductId, rest);
            if (!result.success) {
                showError(`Error al actualizar el producto: ${result.message}`);
                return;
            }

            if (imagenesAEliminarIds && imagenesAEliminarIds.length > 0) {
                const uniqueDeleteIds = Array.from(
                    new Set(imagenesAEliminarIds.filter((x) => x != null))
                );

                const failedDeletes: { imgId: number; message: string }[] = [];
                for (const imgId of uniqueDeleteIds) {
                    const res = await deleteProductImage(numericProductId, imgId);
                    if (!res.success) {
                        const msg = String(res.message || '');
                        if (!msg.includes('Imagen no encontrada')) {
                            failedDeletes.push({ imgId, message: msg });
                        }
                    }
                }
                if (failedDeletes.length > 0) {
                    showError(
                        `No se pudieron eliminar ${failedDeletes.length} imagen(es). ${failedDeletes[0].message || ''}`.trim()
                    );
                    return;
                }
                showSuccess(`${uniqueDeleteIds.length} imagen(es) eliminada(s)`);
            }

            let addedImagesData: AdminAddedImageRef[] = [];

            if (imagenesUrl && imagenesUrl.length > 0) {
                const urlsOriginales = storedImages
                    .map(getImageUrl)
                    .filter(Boolean) as string[];

                const urlsNuevas = imagenesUrl.filter((url) => !urlsOriginales.includes(url));

                if (urlsNuevas.length > 0) {
                    const addImagesResult = await addProductImages(numericProductId, urlsNuevas);

                    if (!addImagesResult.success) {
                        showError(`Error al agregar imágenes: ${addImagesResult.message}`);
                        return;
                    }

                    addedImagesData = Array.isArray(addImagesResult.data)
                        ? addImagesResult.data
                        : [];
                    showSuccess(`${urlsNuevas.length} imagen(es) agregada(s)`);
                }
            }

            let backendPrincipalId = resolvePrincipalBackendId(
                formImages,
                imagenPrincipalId != null ? String(imagenPrincipalId) : null,
                addedImagesData
            );

            const principalFormImg =
                formImages.find((img) => img.id === imagenPrincipalId) ||
                formImages.find((img) => img.principal);

            if (backendPrincipalId == null && principalFormImg?.url) {
                const refreshed = await getProductImages(numericProductId);
                const match = (Array.isArray(refreshed) ? refreshed : []).find(
                    (img) => getImageUrl(img) === principalFormImg.url
                );
                if (match && typeof match !== 'string' && match?.id != null) {
                    backendPrincipalId = Number(match.id);
                }
            }

            if (backendPrincipalId != null && backendPrincipalId !== initialPrincipalId) {
                const res = await changeMainImage(numericProductId, backendPrincipalId);
                if (!res.success) {
                    showError(`Error al definir imagen principal: ${res.message}`);
                    return;
                }
            } else if (
                principalFormImg &&
                !principalFormImg.persisted &&
                initialPrincipalId !== null
            ) {
                showError(
                    'No se pudo asignar la imagen principal. Guarda las imágenes nuevas e inténtalo de nuevo.'
                );
                return;
            }

            await reloadProducts();

            showSuccess('Producto actualizado exitosamente');
            onNavigate('/admin/products');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            showError(`Error al actualizar el producto: ${message}`);
        }
    };

    const handleCancel = () => {
        onNavigate('/admin/products');
    };

    if (error) {
        return (
            <main className="product-edit-container">
                <h1>Error al cargar producto</h1>
                <p className="error">{error}</p>
                <button
                    type="button"
                    onClick={() => onNavigate('/admin/products')}
                    className="btn-secondary"
                >
                    Volver a la lista
                </button>
            </main>
        );
    }

    if (loading || !productData) {
        return (
            <main className="product-edit-container">
                <div className="loading-indicator">Cargando producto...</div>
            </main>
        );
    }

    return (
        <main className="product-edit-container">
            <h1>Editar Producto</h1>
            <ProductForm
                initialData={productData}
                onSubmit={handleUpdate}
                isSubmitting={loading}
                onCancel={handleCancel}
                arbolCategorias={arbolCategorias}
            />
        </main>
    );
}
