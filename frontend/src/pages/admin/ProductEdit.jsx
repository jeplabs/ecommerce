
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCategorias } from '../../context/CategoriasContext';
import { useToast } from '../../context/ToastContext';
import Navbar from "../../components/layout/Navbar/Navbar";
import { ProductForm } from "../../components/admin/ProductForm";


export default function ProductEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { arbolCategorias } = useCategorias();
    const { 
        getProductById, 
        updateProduct, 
        updateProductStatus, 
        addProductImages, 
        deleteProductImage,
        changeMainImage,
        reloadProducts,
        loading
    } = useProduct();
    const { showSuccess, showError } = useToast();
    const [productData, setProductData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                // Usamos el endpoint público para obtener datos completos (descripcion, specs, categorias).
                // Para productos ocultos/descontinuados, este endpoint puede no devolver data (validación backend).
                const product = await getProductById(id);
                // console.log('ProductEdit product', product);
                if (product) {

                    let catId = '';
                    let subcatId = '';
                    let subSubcatId = '';

                    if (product.categorias && product.categorias.length > 0) {
                        catId = product.categorias[0].id?.toString() || '';
                        subcatId = product.categorias[1].id?.toString() || '';
                        subSubcatId = product.categorias[2].id?.toString() || '';
                    }
                    
                    // Transformar los datos del backend para que sean compatibles con el formulario
                    const transformedProduct = {
                        ...product,
                        price: String(product.precioVenta ?? ''), // Confirmar cadena para input
                        descripcion: product.descripcion || '',
                        estado: product.estado || 'disponible',
                        images: product.imagenesUrl || [],
                        categoria: catId?.toString() || '',
                        subcategoria: subcatId?.toString() || '',
                        subsubcategoria: subSubcatId?.toString() || '', // Asumimos que no hay subsubcategoría en este ejemplo
                        moneda: product.moneda || 'USD'
                    };
                    //console.log('ProductEdit transformedProduct:', transformedProduct);
                    setProductData(transformedProduct);
                } else {
                    console.log('ProductEdit getProductById retornó null');
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


    const handleUpdate = async (finalData) => {
        console.debug('ProductEdit handleUpdate payload', finalData);
        try {
            // Forzar siempre la llamada a updateProductStatus para depuración
            const estadoNuevo = finalData.estado || productData.estado;
            //console.log('[ProductEdit] Llamando updateProductStatus con:', estadoNuevo);
            const resEstado = await updateProductStatus(id, estadoNuevo);
            if (!resEstado.success) {
                showError(`Error al actualizar el estado: ${resEstado.message}`);
                return;
            }

            // Actualizar otros datos (sin el campo estado)
            const { estado, ...rest } = finalData;
            const result = await updateProduct(id, rest);
            if (!result.success) {
                showError(`Error al actualizar el producto: ${result.message}`);
                return;
            }

            // Manejar cambios de imágenes si fue en edición
            // if (productData && finalData.imagenesUrl) {
            //     const urlsOriginales = productData.images || [];
            //     const urlsNuevas = finalData.imagenesUrl || [];
            //     const urlsEliminadas = urlsOriginales.filter(url => !urlsNuevas.includes(url));
            //     const urlsAgregadas = urlsNuevas.filter(url => !urlsOriginales.includes(url));
            //     if (urlsEliminadas.length > 0 || urlsAgregadas.length > 0) {
            //         console.debug('ProductEdit imagen cambios - eliminadas:', urlsEliminadas, 'agregadas:', urlsAgregadas);
            //     }
            //     if (urlsAgregadas.length > 0) {
            //         const addImagesResult = await addProductImages(id, urlsAgregadas);
            //         if (!addImagesResult.success) {
            //             console.error('ProductEdit error agregando imágenes:', addImagesResult.message);
            //         } else {
            //             console.debug('ProductEdit imágenes agregadas exitosamente');
            //         }
            //     }
            //     TODO: Eliminar imágenes que fueron quitadas
            // }

            // 1. Eliminar imágenes (El formulario envía los IDs explícitos a borrar)
            if (finalData.imagenesAEliminarIds && finalData.imagenesAEliminarIds.length > 0) {
                console.debug('Eliminando imágenes IDs:', finalData.imagenesAEliminarIds);
                
                for (const imgId of finalData.imagenesAEliminarIds) {
                    const res = await deleteProductImage(id, imgId);
                    if (!res.success) {
                        console.error(`Error al eliminar imagen ${imgId}:`, res.message);
                        // Decidimos si continuar o lanzar error. Aquí continuamos pero podrías lanzar excepción.
                    }
                }
                showSuccess(`${finalData.imagenesAEliminarIds.length} imagen(es) eliminada(s)`);
            }

            // 2. Cambiar imagen principal (Si el usuario seleccionó una nueva)
            if (finalData.imagenPrincipalId) {
                console.debug('Cambiando imagen principal a ID:', finalData.imagenPrincipalId);
                const res = await changeMainImage(id, finalData.imagenPrincipalId);
                if (!res.success) {
                    console.error('Error al cambiar imagen principal:', res.message);
                    showError(`Error al definir imagen principal: ${res.message}`);
                }
            }

            // 3. Agregar nuevas imágenes (Solo las URLs nuevas que vienen en imagenesUrl)
            // Nota: El formulario envía TODAS las URLs actuales en imagenesUrl.
            // Necesitamos filtrar solo las que NO estaban antes para no duplicar llamadas.
            if (finalData.imagenesUrl && finalData.imagenesUrl.length > 0) {
                const urlsOriginales = productData.images || [];
                // Filtramos solo las URLs que son nuevas
                const urlsNuevas = finalData.imagenesUrl.filter(
                    url => !urlsOriginales.includes(url)
                );

                if (urlsNuevas.length > 0) {
                    console.debug('Agregando nuevas URLs:', urlsNuevas);
                    const addImagesResult = await addProductImages(id, urlsNuevas);
                    if (!addImagesResult.success) {
                        console.error('Error agregando imágenes:', addImagesResult.message);
                        showError(`Error al agregar imágenes: ${addImagesResult.message}`);
                    } else {
                        showSuccess(`${urlsNuevas.length} imagen(es) agregada(s)`);
                    }
                }
            }

            // Asegurar que los listados admin queden actualizados antes de volver
            await reloadProducts();

            showSuccess('Estado y producto actualizados exitosamente');
            navigate('/admin/products');
        } catch (error) {
            showError(`Error al actualizar el producto: ${error.message}`);
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