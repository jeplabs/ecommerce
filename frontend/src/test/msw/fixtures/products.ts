import type { ProductApi } from '@/entities/product/model/types';
import type { SpringPage } from '@/shared/api/spring-page';

const baseProduct: Omit<ProductApi, 'id' | 'sku' | 'nombre' | 'slug' | 'stock' | 'estado'> = {
    descripcion: 'Descripción de prueba',
    specs: null,
    precioVenta: 99.99,
    moneda: 'USD',
    imagenes: [
        {
            id: 1,
            url: 'https://placehold.co/400x400/png',
            principal: true,
        },
    ],
    categorias: [],
    createdAt: '2024-06-01T10:00:00',
};

export const mockProduct: ProductApi = {
    ...baseProduct,
    id: 1,
    sku: 'TEST-001',
    nombre: 'Producto de prueba',
    slug: 'producto-de-prueba',
    stock: 10,
    estado: 'DISPONIBLE',
};

export const mockSoldOutProduct: ProductApi = {
    ...baseProduct,
    id: 2,
    sku: 'TEST-002',
    nombre: 'Producto agotado',
    slug: 'producto-agotado',
    stock: 0,
    estado: 'SIN_STOCK',
};

export function mockProductsPage(
    content: ProductApi[] = [mockProduct, mockSoldOutProduct]
): SpringPage<ProductApi> {
    return {
        content,
        totalElements: content.length,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: content.length === 0,
        numberOfElements: content.length,
    };
}
