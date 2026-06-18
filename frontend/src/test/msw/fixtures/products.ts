import type { ProductApi } from '@/entities/product/model/types';
import type { SpringPage } from '@/shared/api/spring-page';

const audioCategory = {
    id: 2,
    nombre: 'Audio',
    slug: 'audio',
    parentId: 1,
    subcategorias: [] as [],
};

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
    specs: { Marca: 'Acme' },
};

export const mockSoldOutProduct: ProductApi = {
    ...baseProduct,
    id: 2,
    sku: 'TEST-002',
    nombre: 'Producto agotado',
    slug: 'producto-agotado',
    stock: 0,
    estado: 'SIN_STOCK',
    precioVenta: 79.99,
};

export const mockProductAlpha: ProductApi = {
    ...baseProduct,
    id: 3,
    sku: 'AUDIO-001',
    nombre: 'Auriculares Alpha',
    slug: 'auriculares-alpha',
    stock: 8,
    estado: 'DISPONIBLE',
    precioVenta: 49.99,
    specs: { Marca: 'Sony' },
    categorias: [audioCategory],
    createdAt: '2025-03-15T10:00:00',
};

export const mockProductBeta: ProductApi = {
    ...baseProduct,
    id: 4,
    sku: 'AUDIO-002',
    nombre: 'Parlante Zebra',
    slug: 'parlante-zebra',
    stock: 3,
    estado: 'DISPONIBLE',
    precioVenta: 199.99,
    specs: { Marca: 'Samsung' },
    categorias: [audioCategory],
    createdAt: '2024-01-10T10:00:00',
};

/** Catálogo completo usado en MSW y Cypress. */
export const mockCatalogProducts: ProductApi[] = [
    mockProduct,
    mockSoldOutProduct,
    mockProductAlpha,
    mockProductBeta,
];

export function mockProductsPage(
    content: ProductApi[] = mockCatalogProducts
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

export function mockProductsPageForCategory(categoriaId: number): SpringPage<ProductApi> {
    const content = mockCatalogProducts.filter((product) =>
        product.categorias.some((category) => category.id === categoriaId)
    );
    return mockProductsPage(content);
}

export function findMockProductBySlug(slug: string): ProductApi | undefined {
    return mockCatalogProducts.find((product) => product.slug === slug);
}

export function findMockProductById(id: number): ProductApi | undefined {
    return mockCatalogProducts.find((product) => product.id === id);
}
