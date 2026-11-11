import { z } from 'zod';
import { API_URL } from '@/config';
import { ApiError, getErrorMessage, parseApi } from '@/lib';
import { getAccessToken } from '@/lib/auth-token-store';
import { getAuthHeaders, notifyUnauthorizedIfNeeded } from '@/lib/http-session';
import {
    productAdminApiSchema,
    productAdminPageSchema,
    productApiSchema,
    productImageApiSchema,
    productStatusSchema,
    type AddProductImagesRequest,
    type CreateProductRequest,
    type ProductAdminApi,
    type ProductAdminPage,
    type ProductApi,
    type ProductImageApi,
    type ProductStatus,
    type UpdateProductPayload,
    type UpdateProductRequest,
} from '../types';
import { invalidateCatalogoCache } from './catalogApi';

const getToken = () =>
    getAccessToken() ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const productImagesSchema = z.array(productImageApiSchema);

async function readJson(response: Response): Promise<unknown> {
    return response.json().catch(() => ({}));
}

function throwApiError(response: Response, raw: unknown, fallback: string): never {
    notifyUnauthorizedIfNeeded(response.status);
    throw new ApiError(getErrorMessage(raw, fallback), response.status, raw);
}

function throwSessionExpired(): never {
    notifyUnauthorizedIfNeeded(401);
    throw new Error('Sesión expirada');
}

async function handleProductAdminJson(
    response: Response,
    fallback: string
): Promise<ProductAdminApi> {
    if (response.status === 401) {
        throwSessionExpired();
    }
    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }
    return parseApi(productAdminApiSchema, raw);
}

async function handleProductAdminPageJson(
    response: Response,
    fallback: string
): Promise<ProductAdminPage> {
    if (response.status === 401) {
        throwSessionExpired();
    }
    const raw = await readJson(response);
    if (!response.ok) {
        throwApiError(response, raw, fallback);
    }
    return parseApi(productAdminPageSchema, raw);
}

function normalizeProductStatus(estado: string): ProductStatus {
    const estadoBackend = estado.replace(/[-\s]/g, '_').toUpperCase();
    return productStatusSchema.parse(estadoBackend);
}

export type AdminProductsQueryParams = {
    nombre?: string;
    categoriaId?: number;
    estado?: ProductStatus;
    page?: number;
    size?: number;
};

/** {@code GET /api/productos/admin?nombre=&categoriaId=&estado=&page=&size=} */
export async function getAdminPage(
    query: AdminProductsQueryParams = {}
): Promise<ProductAdminPage> {
    const params = new URLSearchParams({
        page: String(query.page ?? 0),
        size: String(query.size ?? 24),
    });

    const trimmedNombre = query.nombre?.trim();
    if (trimmedNombre) {
        params.set('nombre', trimmedNombre);
    }
    if (query.categoriaId != null) {
        params.set('categoriaId', String(query.categoriaId));
    }
    if (query.estado) {
        params.set('estado', query.estado);
    }

    const response = await fetch(`${API_URL}/api/productos/admin?${params}`, {
        headers: getAuthHeaders(getToken(), false),
    });

    return handleProductAdminPageJson(response, 'Error al cargar productos admin');
}

/** {@code GET /api/productos/admin?estado=&page=&size=} */
export async function getAdmin(
    estado: ProductStatus,
    page = 0,
    size = 100
): Promise<ProductAdminApi[] | null> {
    const params = new URLSearchParams({
        estado,
        page: String(page),
        size: String(size),
    });

    const response = await fetch(`${API_URL}/api/productos/admin?${params}`, {
        headers: getAuthHeaders(getToken(), false),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }
    if (!response.ok) {
        return null;
    }

    const pageData = await handleProductAdminPageJson(response, 'Error al cargar productos admin');
    return pageData.content;
}

/** {@code GET /api/productos/admin/{id}} */
export async function getByIdAdmin(id: number): Promise<ProductAdminApi> {
    const response = await fetch(`${API_URL}/api/productos/admin/${id}`, {
        headers: getAuthHeaders(getToken(), false),
    });
    return handleProductAdminJson(response, 'Producto no encontrado');
}

/** {@code POST /api/productos} */
export async function create(producto: CreateProductRequest): Promise<ProductApi> {
    const response = await fetch(`${API_URL}/api/productos`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(producto),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }

    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'No se pudo crear el producto'));
    }

    invalidateCatalogoCache();
    return parseApi(productApiSchema, raw);
}

/** {@code PATCH /api/productos/{id}} (+ opcional PATCH precio). */
export async function update(
    id: number,
    productData: UpdateProductPayload
): Promise<ProductApi | null> {
    const headers = getAuthHeaders(getToken());
    const datosActualizar: UpdateProductRequest = {};

    if (productData.nombre !== undefined) datosActualizar.nombre = productData.nombre;
    if (productData.descripcion !== undefined) datosActualizar.descripcion = productData.descripcion;
    if (productData.specs !== undefined) datosActualizar.specs = productData.specs;
    if (productData.stock !== undefined) datosActualizar.stock = productData.stock;
    if (productData.categoriaIds !== undefined) {
        datosActualizar.categoriaIds = productData.categoriaIds;
    }

    let updatedProduct: ProductApi | null = null;

    if (Object.keys(datosActualizar).length > 0) {
        const response = await fetch(`${API_URL}/api/productos/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(datosActualizar),
        });

        if (response.status === 401) {
            throwSessionExpired();
        }

        const raw = await readJson(response);
        if (!response.ok) {
            const message =
                typeof raw === 'string'
                    ? raw
                    : getErrorMessage(raw, 'Error al actualizar el producto');
            throw new Error(message);
        }

        updatedProduct = parseApi(productApiSchema, raw);
    }

    if (productData.precio?.precioVenta !== undefined) {
        const priceResponse = await fetch(`${API_URL}/api/productos/${id}/precio`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(productData.precio),
        });

        if (priceResponse.status === 401) {
            throwSessionExpired();
        }
        if (!priceResponse.ok) {
            const raw = await readJson(priceResponse);
            throw new Error(getErrorMessage(raw, 'Error al actualizar el precio'));
        }
    }

    invalidateCatalogoCache();
    return updatedProduct;
}

/** {@code DELETE /api/productos/{id}} */
export async function deleteProduct(id: number): Promise<true> {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(getToken(), false),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }
    if (!response.ok) {
        const raw = await readJson(response);
        throw new Error(
            typeof raw === 'string' ? raw : getErrorMessage(raw, 'Error al eliminar')
        );
    }

    invalidateCatalogoCache();
    return true;
}

/** {@code PATCH /api/productos/{id}/estado} */
export async function updateStatus(id: number, estado: string): Promise<true> {
    const estadoBackend = normalizeProductStatus(estado);

    const response = await fetch(`${API_URL}/api/productos/${id}/estado`, {
        method: 'PATCH',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify({ estado: estadoBackend }),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }
    if (!response.ok) {
        const raw = await readJson(response);
        throw new Error(
            typeof raw === 'string' ? raw : getErrorMessage(raw, 'Error al actualizar estado')
        );
    }

    invalidateCatalogoCache();
    return true;
}

/** {@code POST /api/productos/{id}/imagenes} */
export async function addImages(
    productId: number,
    imagenesUrl: string[]
): Promise<ProductImageApi[]> {
    const body: AddProductImagesRequest = { imagenesUrl };
    const response = await fetch(`${API_URL}/api/productos/${productId}/imagenes`, {
        method: 'POST',
        headers: getAuthHeaders(getToken()),
        body: JSON.stringify(body),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }

    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(
            typeof raw === 'string' ? raw : getErrorMessage(raw, 'Error al agregar imágenes')
        );
    }

    return parseApi(productImagesSchema, raw);
}

/** {@code GET /api/productos/{id}/imagenes} */
export async function getImages(productId: number): Promise<ProductImageApi[]> {
    const response = await fetch(`${API_URL}/api/productos/${productId}/imagenes`, {
        headers: getAuthHeaders(getToken(), false),
    });

    if (response.status === 401) {
        throwSessionExpired();
    }

    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'No se pudo obtener imágenes'));
    }

    return parseApi(productImagesSchema, raw);
}

/** {@code DELETE /api/productos/{id}/imagenes/{imageId}} */
export async function deleteImage(productId: number, imageId: number): Promise<true> {
    const response = await fetch(
        `${API_URL}/api/productos/${productId}/imagenes/${imageId}`,
        { method: 'DELETE', headers: getAuthHeaders(getToken(), false) }
    );

    if (response.status === 401) {
        throwSessionExpired();
    }
    if (!response.ok) {
        const raw = await readJson(response);
        throw new Error(getErrorMessage(raw, 'Error al eliminar imagen'));
    }

    return true;
}

/** {@code PATCH /api/productos/{id}/imagenes/{imageId}/principal} */
export async function setMainImage(
    productId: number,
    imageId: number
): Promise<ProductImageApi> {
    const response = await fetch(
        `${API_URL}/api/productos/${productId}/imagenes/${imageId}/principal`,
        { method: 'PATCH', headers: getAuthHeaders(getToken(), false) }
    );

    if (response.status === 401) {
        throwSessionExpired();
    }

    const raw = await readJson(response);
    if (!response.ok) {
        throw new Error(getErrorMessage(raw, 'Error al cambiar imagen principal'));
    }

    return parseApi(productImageApiSchema, raw);
}

export const productsAdminApi = {
    getAdminPage,
    getAdmin,
    getByIdAdmin,
    create,
    update,
    delete: deleteProduct,
    deleteProduct,
    updateStatus,
    addImages,
    getImages,
    deleteImage,
    setMainImage,
};
