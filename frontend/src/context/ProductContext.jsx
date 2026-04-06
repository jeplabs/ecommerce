import { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config/config';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct debe ser usado dentro de un ProductProvider');
    }
    return context;
};

// // Función para aplanar el árbol de categorías en una lista
// const flattenCategories = (categories) => {
//     const flattened = [];
    
//     const flatten = (cats) => {
//         cats.forEach(cat => {
//             flattened.push({
//                 id: cat.id,
//                 nombre: cat.nombre,
//                 slug: cat.slug,
//                 parentId: cat.parentId
//             });
//             if (cat.subcategorias && cat.subcategorias.length > 0) {
//                 flatten(cat.subcategorias);
//             }
//         });
//     };
    
//     flatten(categories);
//     //console.log(flattened);
//     return flattened;
// };

export const ProductProvider = ({ children }) => {
    const [productos, setProductos] = useState([]);
    const [productosOcultos, setProductosOcultos] = useState([]);
    const [productosDescontinuados, setProductosDescontinuados] = useState([]);
    // const [categorias, setCategorias] = useState([]);
    // const [subcategorias, setSubcategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userRol } = useAuth();

    const getAuthHeaders = (isJson = true) => {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (isJson) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    }

    const parseListResponse = (raw) => {
        if (raw?.content && Array.isArray(raw.content)) return raw.content;
        if (Array.isArray(raw)) return raw;
        return [];
    };

    const reloadAdminBuckets = async () => {
        const token = localStorage.getItem('token');
        const isAdmin = userRol === 'ROLE_ADMIN';
        if (!token || !isAdmin) return;

        const headers = getAuthHeaders(false);

        const fetchAdmin = async (query) => {
            try {
                const res = await fetch(`${API_URL}/api/productos/admin?${query}`, { headers });
                if (res.status === 401) {
                    console.warn("Token inválido - Redirigiendo al login");
                    localStorage.removeItem('token');
                    localStorage.removeItem('rol');
                    window.location.href = '/login';
                    return null;
                }
                if (!res.ok) {
                    const body = await res.text().catch(() => '');
                    console.warn('[reloadAdminBuckets] admin fetch failed', res.status, body);
                    return null;
                }
                return await res.json();
            } catch (e) {
                console.warn('[reloadAdminBuckets] admin fetch error', e);
                return null;
            }
        };

        const [rawOcultos, rawDescontinuados] = await Promise.all([
            fetchAdmin('estado=OCULTO'),
            fetchAdmin('estado=DESCONTINUADO')
        ]);

        // Si falla alguno, no cortamos el flujo principal (guardar/volver)
        if (rawOcultos) setProductosOcultos(parseListResponse(rawOcultos));
        if (rawDescontinuados) setProductosDescontinuados(parseListResponse(rawDescontinuados));
    };

    const reloadProducts = async () => {
        try {
            // Público: catálogo de cliente no requiere token
            const resProductos = await fetch(`${API_URL}/api/productos`);
            if (!resProductos.ok) throw new Error('No se pudo obtener los productos');

            const rawProductos = await resProductos.json();
            const lista = parseListResponse(rawProductos);
            if (lista.length > 0 || rawProductos?.content || Array.isArray(rawProductos)) {
                setProductos(lista);
            } else {
                console.warn('Formato de productos desconocido:', rawProductos);
                setProductos([]);
            }

            // Si es admin, refrescar también los buckets del panel
            await reloadAdminBuckets();

        } catch (error) {
            console.error('Error al obtener los productos', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getProducts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const isAdmin = userRol === 'ROLE_ADMIN';

                // Intentar cargar categorías (público)
                // let categoriasData = [];
                // try {
                //     const resCategorias = await fetch(`${API_URL}/api/categorias`);
                //     if (resCategorias.ok) {
                //         //const rawCategorias = await resCategorias.json();
                //         categoriasData = await resCategorias.json();
                //         console.log('categoriasData', categoriasData);
                //         //console.log('rawCategorias', rawCategorias);
                //         //categoriasData = flattenCategories(rawCategorias);
                //     }
                // } catch (catError) {
                //     console.error('Error al cargar categorías:', catError);
                // }

                // let categoriasRaiz = [];
                // for (const cat of categoriasData) {
                //     if (cat.parentId === null) {
                //         categoriasRaiz.push(cat);
                //     }
                // }
                // //setCategorias(categoriasRaiz);

                // let subcategoriasData = [];
                // for (const cat of categoriasData) {
                //     if (cat.parentId !== null) {
                //         //console.log('Subcategoría encontrada:', cat.nombre, 'ParentId:', cat.parentId);
                //         subcategoriasData.push(cat);
                //     }
                //     //console.log('Subcategorias encontradas:', subcategoriasData);
                // }
                // //setSubcategorias(subcategoriasData);

                // Público: catálogo cliente
                let productosData = [];
                try {
                    const resProductos = await fetch(`${API_URL}/api/productos`);
                    if (!resProductos.ok) throw new Error('No se pudo obtener los productos');
                    const rawProductos = await resProductos.json();

                    // El backend devuelve un Page de Spring Data, extraer el content
                    productosData = parseListResponse(rawProductos);
                } catch (prodError) {
                    console.error('Error al cargar productos:', prodError);
                }

                // Intentar cargar productos (requiere auth)
                let productosOcultosData = [];
                if (token && isAdmin) {
                    try {
                        const headers = getAuthHeaders(false);
                        const resProductosOcultos = await fetch(`${API_URL}/api/productos/admin?estado=OCULTO`, { headers });

                        if (resProductosOcultos.status === 401) {
                            console.warn("Token inválido - Redirigiendo al login");
                            localStorage.removeItem('token');
                            localStorage.removeItem('rol');
                            window.location.href = '/login';
                            return;
                        }

                        if (resProductosOcultos.ok) {
                            const rawProductos = await resProductosOcultos.json();
                            
                            // El backend devuelve un Page de Spring Data, extraer el content
                            productosOcultosData = parseListResponse(rawProductos);
                        }
                    } catch (prodError) {
                        console.error('Error al cargar productos:', prodError);
                    }
                }
                let productosDescontinuadosData = [];
                if (token && isAdmin) {
                    try {
                        const headers = getAuthHeaders(false);
                        const resProductosDescontinuados = await fetch(`${API_URL}/api/productos/admin?estado=DESCONTINUADO`, { headers });

                        if (resProductosDescontinuados.status === 401) {
                            console.warn("Token inválido - Redirigiendo al login");
                            localStorage.removeItem('token');
                            localStorage.removeItem('rol');
                            window.location.href = '/login';
                            return;
                        }

                        if (resProductosDescontinuados.ok) {
                            const rawProductos = await resProductosDescontinuados.json();
                            
                            // El backend devuelve un Page de Spring Data, extraer el content
                            productosDescontinuadosData = parseListResponse(rawProductos);
                        }
                    } catch (prodError) {
                        console.error('Error al cargar productos:', prodError);
                    }
                }

                setProductos(productosData);
                setProductosOcultos(productosOcultosData);
                setProductosDescontinuados(productosDescontinuadosData);
                // setCategorias(categoriasRaiz);
                // setSubcategorias(subcategoriasData);

            } catch (error) {
                console.error('Error general al cargar datos:', error);
                setProductos([]);
            } finally {
                setLoading(false);
            }
        };
        getProducts();
    }, [userRol]);

    const createProduct = async (producto) => {
        setLoading(true);
        try {
            const resProducto = await fetch(`${API_URL}/api/productos`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify(producto),
            });

            if (resProducto.status === 401) {
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }

            if (!resProducto.ok) {
                const errorData = await resProducto.json();
                throw new Error(errorData.error || 'No se pudo crear el producto');
            }
            
            const nuevoProducto = await resProducto.json();
            setProductos((prev) => [...prev, nuevoProducto]);
            return nuevoProducto;

        } catch (error) {
            console.error('Error al crear el producto', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // const createCategory = async (categoriaDatos) => {
    //     setLoading(true);
    //     try {
    //         const resCategoria = await fetch(`${API_URL}/api/categorias`, {
    //             method: 'POST',
    //             headers: getAuthHeaders(true),
    //             body: JSON.stringify(categoriaDatos),
    //         });

    //         if (resCategoria.status === 401) {
    //             throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    //         }

    //         if (!resCategoria.ok) {
    //             const errorData = await resCategoria.json();
    //             throw new Error(errorData.error || 'No se pudo crear la categoría');
    //         }

    //         const nuevaCategoria = await resCategoria.json();
    //         // actualizar categorias localmente sin recargar
    //         setCategorias((prev) => [...prev, nuevaCategoria]);
    //         return nuevaCategoria;
    //     } catch (error) {
    //         console.error('Error al crear la categoria', error);
    //         throw error;
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const getProductById = async (id) => {
        try {
            const headers = getAuthHeaders(false);
            // Se usa endpoint público para obtener la carga completa: descripcion, imagenesUrl, categorias
            const response = await fetch(`${API_URL}/api/productos/${id}`, { headers });

            if (response.status === 401) {
                console.warn("Token inválido - Redirigiendo al login");
                localStorage.removeItem('token');
                localStorage.removeItem('rol');
                window.location.href = '/login';
                return null;
            }

            if (!response.ok) {
                throw new Error('Producto no encontrado');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener producto por ID:', error);
            throw error;
        }
    };

    const getProductByIdAdmin = async (id) => {
        try {
            const headers = getAuthHeaders(false);
            const response = await fetch(`${API_URL}/api/productos/admin/${id}`, { headers });

            if (response.status === 401) {
                console.warn("Token inválido - Redirigiendo al login");
                localStorage.removeItem('token');
                localStorage.removeItem('rol');
                window.location.href = '/login';
                return null;
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(errorText || 'Producto no encontrado');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener producto admin por ID:', error);
            throw error;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const headers = getAuthHeaders(true);

            console.debug('ProductContext updateProduct payload received', id, productData);

            // Preparar datos para el endpoint PATCH /api/productos/{id}
            const datosActualizar = {};
            if (productData.nombre !== undefined) datosActualizar.nombre = productData.nombre;
            if (productData.descripcion !== undefined) datosActualizar.descripcion = productData.descripcion;
            if (productData.specs !== undefined) datosActualizar.specs = productData.specs;
            if (productData.stock !== undefined) datosActualizar.stock = productData.stock;
            if (productData.categoriaIds !== undefined) datosActualizar.categoriaIds = productData.categoriaIds;

            console.debug('ProductContext datosActualizar', datosActualizar);

            let updatedProduct = null;

            if (Object.keys(datosActualizar).length > 0) {
                const response = await fetch(`${API_URL}/api/productos/${id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(datosActualizar),
                });

                if (response.status === 401) {
                    console.warn("Token inválido - Redirigiendo al login");
                    localStorage.removeItem('token');
                    localStorage.removeItem('rol');
                    window.location.href = '/login';
                    return { success: false, message: 'Sesión expirada' };
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error al actualizar producto:', errorText);
                    return { success: false, message: errorText || 'Error al actualizar producto' };
                }

                updatedProduct = await response.json();
            }

            // Actualizar precio si el formulario lo incluye
            if (productData.precio && productData.precio.precioVenta !== undefined) {
                const priceResponse = await fetch(`${API_URL}/api/productos/${id}/precio`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(productData.precio),
                });

                if (priceResponse.status === 401) {
                    console.warn("Token inválido - Redirigiendo al login");
                    localStorage.removeItem('token');
                    localStorage.removeItem('rol');
                    window.location.href = '/login';
                    return { success: false, message: 'Sesión expirada' };
                }

                if (!priceResponse.ok) {
                    const errorText = await priceResponse.text();
                    console.error('Error al actualizar precio:', errorText);
                    // no salimos: seguimos con los valores que ya tengamos
                }

                // De forma segura, no sobrescribimos la entidad con response de /precio
            }

            // No hacemos modificaciones de imágenes aquí porque el endpoint PATCH/productos no lo maneja

            // Refrescar producto para tener datos consistentes en el estado local
            const refreshedProduct = userRol === 'ROLE_ADMIN'
                ? await getProductByIdAdmin(id)
                : await getProductById(id);
            if (refreshedProduct) {
                setProductos(prev => prev.map(p => p.id === Number(id) ? refreshedProduct : p));
                return { success: true, product: refreshedProduct };
            }

            if (updatedProduct) {
                setProductos(prev => prev.map(p => p.id === id ? updatedProduct : p));
                return { success: true, product: updatedProduct };
            }

            return { success: false, message: 'No se actualizó el producto' };
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    const deleteProduct = async (id) => {
        try {
            console.debug('ProductContext deleteProduct iniciado con id:', id);
            const headers = getAuthHeaders(false);
            const response = await fetch(`${API_URL}/api/productos/${id}`, {
                method: 'DELETE',
                headers,
            });

            console.debug('ProductContext deleteProduct response status:', response.status);

            if (response.status === 401) {
                console.warn("Token inválido - Redirigiendo al login");
                localStorage.removeItem('token');
                localStorage.removeItem('rol');
                window.location.href = '/login';
                return { success: false, message: 'Sesión expirada' };
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('ProductContext Error al eliminar producto:', errorText);
                return { success: false, message: errorText || 'Error al eliminar producto' };
            }

            console.debug('ProductContext deleteProduct exitoso, refrescando listados');
            await reloadProducts();
            return { success: true };
        } catch (error) {
            console.error('ProductContext Error al eliminar producto:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    const addProductImages = async (productId, imagenesUrl) => {
        try {
            const headers = getAuthHeaders(true);
            const response = await fetch(`${API_URL}/api/productos/${productId}/imagenes`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ imagenesUrl }),
            });

            if (response.status === 401) {
                console.warn("Token inválido - Redirigiendo al login");
                localStorage.removeItem('token');
                localStorage.removeItem('rol');
                window.location.href = '/login';
                return { success: false, message: 'Sesión expirada' };
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error al agregar imágenes:', errorText);
                return { success: false, message: errorText || 'Error al agregar imágenes' };
            }

            // Refrescar producto para obtener imágenes actualizadas
            const refreshedProduct = await getProductById(productId);
            if (refreshedProduct) {
                setProductos(prev => prev.map(p => p.id === Number(productId) ? refreshedProduct : p));
                return { success: true, product: refreshedProduct };
            }

            return { success: true };
        } catch (error) {
            console.error('Error al agregar imágenes:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    const updateProductStatus = async (id, estado) => {
        try {
            const headers = getAuthHeaders(true);
            let estadoBackend = estado
                .replace(/[-\s]/g, '_')
                .toUpperCase();
            const validos = ['DISPONIBLE', 'SIN_STOCK', 'OCULTO', 'DESCONTINUADO'];
            if (!validos.includes(estadoBackend)) {
                console.error('[updateProductStatus] Estado no válido para backend:', estado, '->', estadoBackend);
                return { success: false, message: 'Estado no válido' };
            }
            const url = `${API_URL}/api/productos/${id}/estado`;
            const payload = { estado: estadoBackend };
            console.log('[updateProductStatus] PATCH', url, payload);
            const response = await fetch(url, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(payload)
            });
            console.log('[updateProductStatus] response status:', response.status);
            let responseBody = null;
            try {
                responseBody = await response.clone().json();
            } catch {
                responseBody = await response.text();
            }
            console.log('[updateProductStatus] response body:', responseBody);
            if (response.status === 401) {
                console.warn("Token inválido - Redirigiendo al login");
                localStorage.removeItem('token');
                localStorage.removeItem('rol');
                window.location.href = '/login';
                return { success: false, message: 'Sesión expirada' };
            }
            if (!response.ok) {
                console.error('[updateProductStatus] Error al actualizar estado:', responseBody);
                return { success: false, message: responseBody || 'Error al actualizar estado' };
            }
            await reloadProducts(); // incluye buckets admin si corresponde
            return { success: true };
        } catch (error) {
            console.error('[updateProductStatus] Error al actualizar estado:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    return (
        <ProductContext.Provider 
            value={{ 
                productos, 
                productosOcultos,
                productosDescontinuados,
                // categorias, 
                // subcategorias,
                loading,
                createProduct, 
                // createCategory,
                getProductById,
                getProductByIdAdmin,
                updateProduct, 
                updateProductStatus,
                deleteProduct,
                addProductImages,
                reloadProducts
            }}>
            {children}
        </ProductContext.Provider>
    );
};