import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useToast } from '../../context/ToastContext';
import Navbar from "../../components/Navbar"
import { ProductForm } from "../../components/admin/ProductForm";

export default function ProductEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getProductById, updateProduct, addProductImages, loading, categorias } = useProduct();
    const { showSuccess, showError } = useToast();
    const [productData, setProductData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                console.log('ProductEdit loadProduct iniciado con id:', id);
                const product = await getProductById(id);
                console.log('ProductEdit getProductById retornó:', product);
                
                if (product) {
                    // Transformar los datos del backend para que sean compatibles con el formulario
                    const transformedProduct = {
                        ...product,
                        price: String(product.precioVenta ?? ''), // Confirmar cadena para input
                        descripcion: product.descripcion || '',
                        estado: product.active ? 'activo' : 'inactivo',
                        // La forma esperada por ProductForm es array de URLs (strings) o items con type/url.
                        images: product.imagenesUrl || [],
                        categoria: product.categorias?.[0]?.id?.toString() || '',
                        moneda: product.moneda || 'USD'
                    };
                    console.log('ProductEdit transformedProduct:', transformedProduct);
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
            // Actualizar datos básicos
            const result = await updateProduct(id, finalData);
            console.debug('ProductEdit updateProduct result', result);
            
            if (!result.success) {
                showError(`Error al actualizar el producto: ${result.message}`);
                return;
            }

            // Manejar cambios de imágenes si fue en edición
            if (productData && finalData.imagenesUrl) {
                const urlsOriginales = productData.images || []; // array de strings (URLs)
                const urlsNuevas = finalData.imagenesUrl || []; // array de strings (URLs)
                
                // URLs que fueron eliminadas
                const urlsEliminadas = urlsOriginales.filter(url => !urlsNuevas.includes(url));
                
                // URLs que fueron agregadas
                const urlsAgregadas = urlsNuevas.filter(url => !urlsOriginales.includes(url));
                
                if (urlsEliminadas.length > 0 || urlsAgregadas.length > 0) {
                    console.debug('ProductEdit imagen cambios - eliminadas:', urlsEliminadas, 'agregadas:', urlsAgregadas);
                }
                
                // Agregar nuevas imágenes
                if (urlsAgregadas.length > 0) {
                    const addImagesResult = await addProductImages(id, urlsAgregadas);
                    if (!addImagesResult.success) {
                        console.error('ProductEdit error agregando imágenes:', addImagesResult.message);
                        // No salimos del flujo, las imágenes ya estaban pero esto es un detalle
                    } else {
                        console.debug('ProductEdit imágenes agregadas exitosamente');
                    }
                }
                
                // TODO: Eliminar imágenes que fueron quitadas
                // Requeriría obtener los IDs de las imágenes del backend
            }
            
            showSuccess('Producto actualizado exitosamente');
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
                    categorias={categorias}
                />
            </main>
        </>
    );
}