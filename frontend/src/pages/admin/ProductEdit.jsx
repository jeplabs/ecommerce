
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCategorias } from '../../context/CategoriasContext';
import { useToast } from '../../context/ToastContext';
import Navbar from "../../components/layout/Navbar/Navbar";
import { ProductForm } from "../../components/admin/ProductForm";
import {
    getImageUrl,
    getInitialPrincipalBackendId,
    resolvePrincipalBackendId,
} from '../../utils/productImageAdmin';

export default function ProductEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
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
    const [productData, setProductData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const [adminRes, publicRes] = await Promise.allSettled([
                    getProductByIdAdmin(id),
                    getProductById(id),
                ]);

                const adminProduct = adminRes.status === 'fulfilled' ? adminRes.value : null;
                const publicProduct = publicRes.status === 'fulfilled' ? publicRes.value : null;

                const baseProduct = publicProduct || adminProduct;
                const imagesMeta = baseProduct ? await getProductImages(id) : [];
                const product = baseProduct
                    ? {
                          ...baseProduct,
                          images: Array.isArray(imagesMeta) ? imagesMeta : [],
                          descripcion:
                              baseProduct.descripcion ??
                              publicProduct?.descripcion ??
                              adminProduct?.descripcion,
                      }
                    : null;

                if (product) {
                    let catId = '';
                    let subcatId = '';
                    let subSubcatId = '';

                    if (product.categorias && product.categorias.length > 0) {
                        catId = product.categorias[0].id?.toString() || '';
                        subcatId = product.categorias[1].id?.toString() || '';
                        subSubcatId = product.categorias[2].id?.toString() || '';
                    }

                    const transformedProduct = {
                        ...product,
                        price: String(product.precioVenta ?? ''),
                        descripcion: product.descripcion || '',
                        estado: product.estado || 'disponible',
                        images: product.images ?? [],
                        categoria: catId?.toString() || '',
                        subcategoria: subcatId?.toString() || '',
                        subsubcategoria: subSubcatId?.toString() || '',
                        moneda: product.moneda || 'USD',
                    };
                    setProductData(transformedProduct);
                } else {
                    setError('Producto no encontrado');
                }
            } catch (err) {
                setError('Error al cargar el producto');
                console.error('ProductEdit Error loading product:', err);
            }
        };

        if (id) {
            loadProduct();
        }
    }, [id]);

    const handleUpdate = async (finalData, formImages = []) => {
        try {
            const productId = Number.isFinite(Number(id)) ? Number(id) : id;
            const initialPrincipalId = getInitialPrincipalBackendId(productData?.images);

            const estadoNuevo = finalData.estado || productData.estado;
            const resEstado = await updateProductStatus(productId, estadoNuevo);
            if (!resEstado.success) {
                showError(`Error al actualizar el estado: ${resEstado.message}`);
                return;
            }

            const { estado, ...rest } = finalData;
            const result = await updateProduct(productId, rest);
            if (!result.success) {
                showError(`Error al actualizar el producto: ${result.message}`);
                return;
            }

            if (finalData.imagenesAEliminarIds?.length > 0) {
                const uniqueDeleteIds = Array.from(
                    new Set(finalData.imagenesAEliminarIds.filter((x) => x != null))
                );

                const failedDeletes = [];
                for (const imgId of uniqueDeleteIds) {
                    const res = await deleteProductImage(productId, imgId);
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

            let addedImagesData = [];

            if (finalData.imagenesUrl?.length > 0) {
                const urlsOriginales = (productData.images || [])
                    .map(getImageUrl)
                    .filter(Boolean);

                const urlsNuevas = finalData.imagenesUrl.filter(
                    (url) => !urlsOriginales.includes(url)
                );

                if (urlsNuevas.length > 0) {
                    const addImagesResult = await addProductImages(productId, urlsNuevas);

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
                finalData.imagenPrincipalId,
                addedImagesData
            );

            const principalFormImg =
                formImages.find((img) => img.id === finalData.imagenPrincipalId) ||
                formImages.find((img) => img.principal);

            if (backendPrincipalId == null && principalFormImg?.url) {
                const refreshed = await getProductImages(productId);
                const match = (Array.isArray(refreshed) ? refreshed : []).find(
                    (img) => getImageUrl(img) === principalFormImg.url
                );
                if (match?.id != null) {
                    backendPrincipalId = Number(match.id);
                }
            }

            if (
                backendPrincipalId != null &&
                backendPrincipalId !== initialPrincipalId
            ) {
                const res = await changeMainImage(productId, backendPrincipalId);
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
            navigate('/admin/products');
        } catch (err) {
            showError(`Error al actualizar el producto: ${err.message}`);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    if (error) {
        return (
            <>
                <Navbar />
                <main className="product-edit-container">
                    <h1>Error al cargar producto</h1>
                    <p className="error">{error}</p>
                    <button onClick={() => navigate('/admin/products')} className="btn-secondary">
                        Volver a la lista
                    </button>
                </main>
            </>
        );
    }

    if (loading || !productData) {
        return (
            <>
                <Navbar />
                <main className="product-edit-container">
                    <div className="loading-indicator">Cargando producto...</div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
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
        </>
    );
}
