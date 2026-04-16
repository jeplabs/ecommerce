import { API_URL } from '../config/config';
//import { getAuthHeaders, parseListResponse, isAuthError } from '../utils/apiHelpers';

// Helper para headers (igual que tu función original)
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
};

// Helper para parsear respuestas de Spring Data Page
const parseListResponse = (raw) => {
    if (raw?.content && Array.isArray(raw.content)) return raw.content;
    if (Array.isArray(raw)) return raw;
    return [];
};

export const productService = {
    // Obtener productos paginados y filtrados por categoría
    getByCategory: async (categoriaId, page = 1, limit = 10) => {
        const params = new URLSearchParams({
            categoriaId: categoriaId,
            page: page,
            limit: limit
        });
        
        const res = await fetch(`${API_URL}/api/productos?${params.toString()}`);
        
        if (!res.ok) {
            throw new Error(res.statusText || 'Error al cargar productos de la categoría');
        }
        
        return res.json();
    },
    
    // Si necesitas obtener todos (para el catálogo general) y tu API lo soporta con paginación
    // getAll: async (page = 1, limit = 20) => {
    //     const params = new URLSearchParams({
    //         page: page,
    //         limit: limit
    //     });
    //     const res = await fetch(`${API_URL}/api/productos?${params.toString()}`);
    //     if (!res.ok) throw new Error('Error al cargar todos los productos');
    //     return res.json();
    // },
    
    // 1. Obtener todos los productos públicos
    getAll: async () => {
        const res = await fetch(`${API_URL}/api/productos`);
        if (!res.ok) throw new Error('No se pudo obtener los productos');
        const raw = await res.json();
        return parseListResponse(raw);
    },

    // 2. Obtener productos administrativos (filtrados por estado)
    getAdmin: async (estado) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autorizado');

        const res = await fetch(`${API_URL}/api/productos/admin?estado=${estado}`, {
            headers: getAuthHeaders(false)
        });

        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            window.location.href = '/login';
            return null;
        }
        if (!res.ok) return null;
        
        const raw = await res.json();
        return parseListResponse(raw);
    },

    // 3. Obtener producto por ID (Público)
    getById: async (id) => {
        const res = await fetch(`${API_URL}/api/productos/${id}`, { headers: getAuthHeaders(false) });
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            window.location.href = '/login';
            return null;
        }
        if (!res.ok) throw new Error('Producto no encontrado');
        return await res.json();
    },

    // 4. Obtener producto por ID (Admin)
    getByIdAdmin: async (id) => {
        const res = await fetch(`${API_URL}/api/productos/admin/${id}`, { headers: getAuthHeaders(false) });
        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            window.location.href = '/login';
            return null;
        }
        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            throw new Error(errorText || 'Producto no encontrado');
        }
        return await res.json();
    },

    // 5. Crear Producto
    create: async (producto) => {
        const res = await fetch(`${API_URL}/api/productos`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify(producto),
        });

        if (res.status === 401) throw new Error('Sesión expirada');
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'No se pudo crear el producto');
        }
        return await res.json();
    },

    // 6. Actualizar Producto (PATCH)
    update: async (id, productData) => {
        const headers = getAuthHeaders(true);
        const datosActualizar = {};
        
        // Mapeo seguro de campos
        if (productData.nombre !== undefined) datosActualizar.nombre = productData.nombre;
        if (productData.descripcion !== undefined) datosActualizar.descripcion = productData.descripcion;
        if (productData.specs !== undefined) datosActualizar.specs = productData.specs;
        if (productData.stock !== undefined) datosActualizar.stock = productData.stock;
        if (productData.categoriaIds !== undefined) datosActualizar.categoriaIds = productData.categoriaIds;

        let updatedProduct = null;

        // Actualizar datos básicos
        if (Object.keys(datosActualizar).length > 0) {
            const res = await fetch(`${API_URL}/api/productos/${id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(datosActualizar),
            });
            if (res.status === 401) throw new Error('Sesión expirada');
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }
            updatedProduct = await res.json();
        }

        // Actualizar precio si existe
        if (productData.precio && productData.precio.precioVenta !== undefined) {
            await fetch(`${API_URL}/api/productos/${id}/precio`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(productData.precio),
            });
            // Nota: No sobrescribimos updatedProduct con la respuesta de precio
        }

        return updatedProduct;
    },

    // 7. Eliminar Producto
    delete: async (id) => {
        const res = await fetch(`${API_URL}/api/productos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(false),
        });

        if (res.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            window.location.href = '/login';
            throw new Error('Sesión expirada');
        }
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Error al eliminar');
        }
        return true;
    },

    // 8. Actualizar Estado
    updateStatus: async (id, estado) => {
        let estadoBackend = estado.replace(/[-\s]/g, '_').toUpperCase();
        const validos = ['DISPONIBLE', 'SIN_STOCK', 'OCULTO', 'DESCONTINUADO'];
        if (!validos.includes(estadoBackend)) throw new Error('Estado no válido');

        const res = await fetch(`${API_URL}/api/productos/${id}/estado`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ estado: estadoBackend }),
        });

        if (res.status === 401) throw new Error('Sesión expirada');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText);
        }
        return true;
    },

    // 9. Agregar Imágenes
    addImages: async (productId, imagenesUrl) => {
        const res = await fetch(`${API_URL}/api/productos/${productId}/imagenes`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: JSON.stringify({ imagenesUrl }),
        });

        if (res.status === 401) throw new Error('Sesión expirada');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText);
        }
        return true;
    },

    // 9b. Listar imágenes (incluye id/url/principal)
    getImages: async (productId) => {
        const res = await fetch(`${API_URL}/api/productos/${productId}/imagenes`, {
            headers: getAuthHeaders(false),
        });
        if (res.status === 401) throw new Error('Sesión expirada');
        if (!res.ok) {
            const errorText = await res.text().catch(() => '');
            throw new Error(errorText || 'No se pudo obtener imágenes');
        }
        return await res.json();
    },

    // 10. Eliminar una imagen específica
    deleteImage: async (productId, imageId) => {
        const res = await fetch(`${API_URL}/api/productos/${productId}/imagenes/${imageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(false),
        });
        if (res.status === 401) throw new Error('Sesión expirada');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Error al eliminar imagen');
        }
        return true;
    },

    // 11. Cambiar imagen principal
    setMainImage: async (productId, imageId) => {
        const res = await fetch(`${API_URL}/api/productos/${productId}/imagenes/${imageId}/principal`, {
            method: 'PATCH',
            headers: getAuthHeaders(false), // El endpoint no suele requerir body si solo usa path params
        });
        if (res.status === 401) throw new Error('Sesión expirada');
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Error al cambiar imagen principal');
        }
        return await res.json(); // Retorna la imagen actualizada
    }
};
