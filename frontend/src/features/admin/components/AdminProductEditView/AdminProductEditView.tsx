import { useEffect, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useCategorias, useProduct, useToast } from '@/app/providers';
import {
    productsAdminApi,
    productsApi,
    type ProductAdminApi,
    type ProductApi,
    type ProductStatus,
    type UpdateProductPayload,
} from '@/features/catalog';
import { ProductForm } from '../ProductForm';
import { FieldError } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import type {
    ProductFormInitialData,
    ProductFormSubmitPayload,
} from '../ProductForm';
import {
    getImageUrl,
    getInitialPrincipalBackendId,
    resolvePrincipalBackendId,
    type AdminAddedImageRef,
    type AdminImageApiSource,
    type AdminProductFormImage,
} from '../../lib/product-image-admin';
import styles from './AdminProductEditView.module.css';

type AdminProductEditViewProps = {
    productId: string | number;
    onNavigate: NavigateFunction;
};

function toNumericProductId(productId: string | number): number {
    return typeof productId === 'number' ? productId : Number(productId);
}

function normalizeFormSpecs(
    specs: Record<string, unknown> | null | undefined
): Record<string, string> | undefined {
    if (!specs) return undefined;
    const entries = Object.entries(specs).filter(([key]) => key.trim() !== '');
    if (entries.length === 0) return undefined;
    return Object.fromEntries(
        entries.map(([key, value]) => [key, value == null ? '' : String(value)])
    );
}

function mapLoadedProductToFormData(
    adminProduct: ProductAdminApi | null,
    publicProduct: ProductApi | null
): ProductFormInitialData {
    const base = adminProduct ?? publicProduct!;
    const categorias =
        adminProduct?.categorias && adminProduct.categorias.length > 0
            ? adminProduct.categorias
            : publicProduct?.categorias ?? [];
    const descripcion =
        adminProduct?.descripcion != null
            ? adminProduct.descripcion
            : publicProduct?.descripcion ?? '';
    const rawSpecs =
        adminProduct?.specs !== undefined ? adminProduct.specs : publicProduct?.specs;

    return {
        nombre: base.nombre,
        sku: base.sku,
        descripcion,
        price: String(base.precioVenta ?? ''),
        stock: String(base.stock ?? ''),
        estado: base.estado,
        moneda: base.moneda,
        categorias,
        specs: normalizeFormSpecs(rawSpecs),
        images: base.imagenes ?? [],
    };
}

function normalizeStatusToBackend(estado: string): ProductStatus {
    return estado.replace(/[-\s]/g, '_').toUpperCase() as ProductStatus;
}

export default function AdminProductEditView({ productId, onNavigate }: AdminProductEditViewProps) {
    const { arbolCategorias } = useCategorias();
    const { reloadProducts } = useProduct();
    const { showSuccess, showError } = useToast();

    const [productData, setProductData] = useState<ProductFormInitialData | null>(null);
    const [storedImages, setStoredImages] = useState<AdminImageApiSource[]>([]);
    const [preserveMissingMetadata, setPreserveMissingMetadata] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const numericProductId = toNumericProductId(productId);

    useEffect(() => {
        if (!productId || !Number.isFinite(numericProductId) || numericProductId <= 0) {
            setError('Identificador de producto inválido');
            setLoadingProduct(false);
            return;
        }

        let cancelled = false;

        const loadProduct = async () => {
            setLoadingProduct(true);
            setError(null);

            try {
                // El endpoint público (/api/productos/:id) falla para OCULTO/DESCONTINUADO;
                // por eso usamos el endpoint admin como fuente primaria (con fallback al público
                // solo para completar metadata extendida si el backend aún no la envía en admin).
                const [adminRes, publicRes] = await Promise.allSettled([
                    productsAdminApi.getByIdAdmin(numericProductId),
                    productsApi.getById(numericProductId),
                ]);

                if (cancelled) return;

                const adminProduct = adminRes.status === 'fulfilled' ? adminRes.value : null;
                const publicProduct = publicRes.status === 'fulfilled' ? publicRes.value : null;

                if (!adminProduct && !publicProduct) {
                    setError('Producto no encontrado');
                    return;
                }

                const formData = mapLoadedProductToFormData(adminProduct, publicProduct);
                const images = formData.images ?? [];
                const missingMetadata =
                    !publicProduct &&
                    (!adminProduct?.categorias || adminProduct.categorias.length === 0);

                setPreserveMissingMetadata(missingMetadata);
                setStoredImages(images);
                setProductData(formData);
            } catch (err) {
                if (cancelled) return;
                setError('Error al cargar el producto');
                console.error('ProductEdit Error loading product:', err);
            } finally {
                if (!cancelled) {
                    setLoadingProduct(false);
                }
            }
        };

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [productId, numericProductId]);

    const handleUpdate = async (
        finalData: ProductFormSubmitPayload,
        formImages: AdminProductFormImage[] = []
    ) => {
        if (!productData || isSaving) return;

        setIsSaving(true);
        try {
            const initialPrincipalId = getInitialPrincipalBackendId(storedImages);
            const estadoNuevo = normalizeStatusToBackend(
                finalData.estado || String(productData.estado || 'DISPONIBLE')
            );

            const {
                estado: _estado,
                sku: _sku,
                imagenesUrl,
                imagenesAEliminarIds,
                imagenPrincipalId,
                categoriaIds,
                descripcion,
                specs,
                ...updateFields
            } = finalData;

            // Si editamos un producto oculto sin metadata pública y el usuario no re-ingresó
            // descripción/categorías/specs, omitimos esos campos para que PATCH no los pise.
            const updatePayload: UpdateProductPayload = {
                ...updateFields,
                ...(descripcion != null || !preserveMissingMetadata
                    ? { descripcion: descripcion ?? null }
                    : {}),
                ...(specs != null || !preserveMissingMetadata ? { specs: specs ?? null } : {}),
                ...(categoriaIds.length > 0 ? { categoriaIds } : {}),
            };

            // 1. Actualizar campos y precio ANTES de cambiar el estado (p.ej. a OCULTO)
            await productsAdminApi.update(numericProductId, updatePayload);

            // 2. Eliminar imágenes quitadas
            if (imagenesAEliminarIds && imagenesAEliminarIds.length > 0) {
                const uniqueDeleteIds = Array.from(
                    new Set(imagenesAEliminarIds.filter((x) => x != null))
                );

                for (const imgId of uniqueDeleteIds) {
                    try {
                        await productsAdminApi.deleteImage(numericProductId, imgId);
                    } catch (err) {
                        const msg = err instanceof Error ? err.message : String(err);
                        if (!msg.includes('Imagen no encontrada')) {
                            showError(`No se pudieron eliminar imágenes. ${msg}`.trim());
                            return;
                        }
                    }
                }
                showSuccess(`${uniqueDeleteIds.length} imagen(es) eliminada(s)`);
            }

            // 3. Agregar imágenes nuevas
            let addedImagesData: AdminAddedImageRef[] = [];
            if (imagenesUrl && imagenesUrl.length > 0) {
                const urlsOriginales = storedImages
                    .map(getImageUrl)
                    .filter(Boolean) as string[];

                const urlsNuevas = imagenesUrl.filter((url) => !urlsOriginales.includes(url));

                if (urlsNuevas.length > 0) {
                    addedImagesData = await productsAdminApi.addImages(numericProductId, urlsNuevas);
                    showSuccess(`${urlsNuevas.length} imagen(es) agregada(s)`);
                }
            }

            // 4. Actualizar imagen principal (solo mediante datos admin, nunca GET público de imágenes)
            let backendPrincipalId = resolvePrincipalBackendId(
                formImages,
                imagenPrincipalId != null ? String(imagenPrincipalId) : null,
                addedImagesData
            );

            const principalFormImg =
                formImages.find((img) => img.id === imagenPrincipalId) ||
                formImages.find((img) => img.principal);

            if (backendPrincipalId == null && principalFormImg?.url) {
                const refreshedAdmin = await productsAdminApi.getByIdAdmin(numericProductId);
                const match = (refreshedAdmin.imagenes ?? []).find(
                    (img) => getImageUrl(img) === principalFormImg.url
                );
                if (match?.id != null) {
                    backendPrincipalId = Number(match.id);
                }
            }

            if (backendPrincipalId != null && backendPrincipalId !== initialPrincipalId) {
                await productsAdminApi.setMainImage(numericProductId, backendPrincipalId);
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

            // 5. Cambiar estado AL FINAL para que un cambio a OCULTO o stock=0 no interfiera con pasos previos
            await productsAdminApi.updateStatus(numericProductId, estadoNuevo);

            // 6. Invalidar caché pública sin bloquear ni causar race de recarga dentro del formulario
            void reloadProducts(true).catch(() => {});

            showSuccess('Producto actualizado exitosamente');
            onNavigate('/admin/products');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error desconocido';
            showError(`Error al actualizar el producto: ${message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        onNavigate('/admin/products');
    };

    if (error) {
        return (
            <main className={styles.root}>
                <h1>Error al cargar producto</h1>
                <FieldError>{error}</FieldError>
                <Button type="button" variant="secondary" onClick={() => onNavigate('/admin/products')}>
                    Volver a la lista
                </Button>
            </main>
        );
    }

    if (loadingProduct || !productData) {
        return (
            <main className={styles.root}>
                <div className={styles.loading}>Cargando producto...</div>
            </main>
        );
    }

    return (
        <>
            <button type="button" className={styles.back} onClick={handleCancel}>
                ← Volver a Productos
            </button>
            <main className={styles.root}>
                <h1>Editar Producto</h1>
                {preserveMissingMetadata && (
                    <p className={styles.notice} role="status">
                        Este producto no es público actualmente. Los campos de descripción,
                        especificaciones y categorías no son devueltos por el endpoint admin actual;
                        si los dejas sin cambios se conservarán los actuales en el servidor.
                    </p>
                )}
                <ProductForm
                    initialData={productData}
                    onSubmit={handleUpdate}
                    isSubmitting={isSaving}
                    onCancel={handleCancel}
                    arbolCategorias={arbolCategorias}
                    preserveMissingMetadata={preserveMissingMetadata}
                />
            </main>
        </>
    );
}
