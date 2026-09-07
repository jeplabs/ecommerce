import type { CategoryApi } from '@/entities/category/model/schemas/api';
import type { ProductAdminApi, ProductApi, ProductStatus } from '@/entities/product/model/types';
import type { CreateProductRequest } from '@/entities/product/model/schemas/forms';
import type { SpringPage } from '@/shared/api/spring-page';
import { mockCategories } from './categories';
import { mockCatalogProducts } from './products';

type DynamicProduct = ProductApi & {
    precioCosto: number;
    margenPorcentaje: number;
};

let products: DynamicProduct[] = [];
let nextProductId = 100;
let nextImageId = 1000;

function slugify(nombre: string): string {
    return nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function flattenCategories(nodes: CategoryApi[]): CategoryApi[] {
    const result: CategoryApi[] = [];
    for (const node of nodes) {
        result.push(node);
        if (node.subcategorias?.length) {
            result.push(...flattenCategories(node.subcategorias));
        }
    }
    return result;
}

const categoryById = new Map(flattenCategories(mockCategories).map((c) => [c.id, c]));

function resolveCategories(ids: number[]): CategoryApi[] {
    return ids
        .map((id) => categoryById.get(id))
        .filter((c): c is CategoryApi => Boolean(c))
        .map((c) => ({ ...c, subcategorias: c.subcategorias ?? [] }));
}

function computeMargin(precioVenta: number, precioCosto: number): number {
    if (precioCosto <= 0) return 0;
    return Math.round(((precioVenta - precioCosto) / precioCosto) * 10000) / 100;
}

function toProductApi(product: DynamicProduct): ProductApi {
    const { precioCosto: _c, margenPorcentaje: _m, ...api } = product;
    return { ...api, imagenes: product.imagenes.map((img) => ({ ...img })) };
}

function toProductAdminApi(product: DynamicProduct): ProductAdminApi {
    return {
        id: product.id,
        sku: product.sku,
        nombre: product.nombre,
        slug: product.slug,
        stock: product.stock,
        estado: product.estado,
        precioVenta: product.precioVenta,
        precioCosto: product.precioCosto,
        margenPorcentaje: product.margenPorcentaje,
        moneda: product.moneda,
        imagenes: product.imagenes.map((img) => ({ ...img })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}

function fromCatalogProduct(
    product: (typeof mockCatalogProducts)[number],
    precioCosto = product.precioVenta * 0.6
): DynamicProduct {
    return {
        ...product,
        precioCosto,
        margenPorcentaje: computeMargin(product.precioVenta, precioCosto),
        updatedAt: product.updatedAt ?? product.createdAt,
    };
}

export function resetDynamicProducts() {
    products = mockCatalogProducts.map((p) => fromCatalogProduct(p));
    nextProductId = 100;
    nextImageId = 1000;
}

export function ensureDynamicProducts() {
    if (products.length === 0) {
        resetDynamicProducts();
    }
}

export function getDynamicPublicProducts(): ProductApi[] {
    return products
        .filter((p) => p.estado === 'DISPONIBLE' || p.estado === 'SIN_STOCK')
        .map(toProductApi);
}

export function mockDynamicProductsPage(content?: ProductApi[]): SpringPage<ProductApi> {
    const items = content ?? getDynamicPublicProducts();
    return {
        content: items,
        totalElements: items.length,
        totalPages: 1,
        size: 20,
        number: 0,
        first: true,
        last: true,
        empty: items.length === 0,
        numberOfElements: items.length,
    };
}

export function mockDynamicProductsPageForCategory(categoriaId: number): SpringPage<ProductApi> {
    const content = getDynamicPublicProducts().filter((product) =>
        product.categorias.some((category) => category.id === categoriaId)
    );
    return mockDynamicProductsPage(content);
}

export function findDynamicProductBySlug(slug: string): ProductApi | undefined {
    const product = products.find((p) => p.slug === slug);
    if (!product || (product.estado !== 'DISPONIBLE' && product.estado !== 'SIN_STOCK')) {
        return undefined;
    }
    return toProductApi(product);
}

export function findDynamicProductById(id: number): ProductApi | undefined {
    const product = products.find((p) => p.id === id);
    return product ? toProductApi(product) : undefined;
}

export function findDynamicProductAdminById(id: number): ProductAdminApi | undefined {
    const product = products.find((p) => p.id === id);
    return product ? toProductAdminApi(product) : undefined;
}

export function getDynamicAdminProducts(estado: ProductStatus): ProductAdminApi[] {
    return products.filter((p) => p.estado === estado).map(toProductAdminApi);
}

export function mockDynamicAdminProductsPage(estado: ProductStatus): SpringPage<ProductAdminApi> {
    const content = getDynamicAdminProducts(estado);
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

export function createDynamicProduct(body: CreateProductRequest): ProductApi {
    const id = nextProductId++;
    const slug = slugify(body.nombre);
    const now = '2026-05-28T12:00:00';
    const imagenes =
        body.imagenesUrl?.map((url, index) => ({
            id: nextImageId++,
            url,
            principal: index === 0,
        })) ?? [];

    const product: DynamicProduct = {
        id,
        sku: body.sku,
        nombre: body.nombre,
        slug,
        descripcion: body.descripcion ?? null,
        specs: body.specs ?? null,
        stock: body.stock,
        estado: 'DISPONIBLE',
        precioVenta: body.precio.precioVenta,
        precioCosto: body.precio.precioCosto,
        margenPorcentaje: computeMargin(body.precio.precioVenta, body.precio.precioCosto),
        moneda: body.precio.moneda,
        imagenes,
        categorias: resolveCategories(body.categoriaIds),
        createdAt: now,
        updatedAt: now,
    };

    products.push(product);
    return toProductApi(product);
}

export function updateDynamicProduct(
    id: number,
    patch: {
        nombre?: string;
        descripcion?: string | null;
        specs?: Record<string, unknown> | null;
        stock?: number;
        categoriaIds?: number[];
    }
): ProductApi {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
        throw new Error('Producto no encontrado');
    }

    const current = products[index]!;
    const updated: DynamicProduct = {
        ...current,
        nombre: patch.nombre ?? current.nombre,
        descripcion: patch.descripcion !== undefined ? patch.descripcion : current.descripcion,
        specs: patch.specs !== undefined ? patch.specs : current.specs,
        stock: patch.stock ?? current.stock,
        categorias: patch.categoriaIds
            ? resolveCategories(patch.categoriaIds)
            : current.categorias,
        updatedAt: '2026-05-28T12:30:00',
    };

    products[index] = updated;
    return toProductApi(updated);
}

export function updateDynamicProductPrice(
    id: number,
    precio: { precioVenta: number; precioCosto?: number; moneda?: string }
): void {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
        throw new Error('Producto no encontrado');
    }

    const current = products[index]!;
    const precioCosto = precio.precioCosto ?? current.precioCosto;
    products[index] = {
        ...current,
        precioVenta: precio.precioVenta,
        precioCosto,
        margenPorcentaje: computeMargin(precio.precioVenta, precioCosto),
        moneda: precio.moneda ?? current.moneda,
        updatedAt: '2026-05-28T12:30:00',
    };
}

export function deleteDynamicProduct(id: number): void {
    updateDynamicProductStatus(id, 'OCULTO');
}

export function updateDynamicProductStatus(id: number, estado: ProductStatus): ProductApi {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
        throw new Error('Producto no encontrado');
    }

    products[index] = {
        ...products[index]!,
        estado,
        updatedAt: '2026-05-28T12:30:00',
    };

    return toProductApi(products[index]!);
}

export function getDynamicProductImages(id: number) {
    const product = products.find((p) => p.id === id);
    if (!product) {
        throw new Error('Producto no encontrado');
    }
    return product.imagenes.map((img) => ({ ...img }));
}

export function addDynamicProductImages(id: number, urls: string[]) {
    const product = products.find((p) => p.id === id);
    if (!product) {
        throw new Error('Producto no encontrado');
    }

    const newImages = urls.map((url) => ({
        id: nextImageId++,
        url,
        principal: product.imagenes.length === 0,
    }));

    product.imagenes.push(...newImages);
    product.updatedAt = '2026-05-28T12:30:00';
    return newImages.map((img) => ({ ...img }));
}

export function deleteDynamicProductImage(productId: number, imageId: number): void {
    const product = products.find((p) => p.id === productId);
    if (!product) {
        throw new Error('Producto no encontrado');
    }

    product.imagenes = product.imagenes.filter((img) => img.id !== imageId);
    if (product.imagenes.length > 0 && !product.imagenes.some((img) => img.principal)) {
        product.imagenes[0]!.principal = true;
    }
    product.updatedAt = '2026-05-28T12:30:00';
}

export function setDynamicProductMainImage(productId: number, imageId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) {
        throw new Error('Producto no encontrado');
    }

    const target = product.imagenes.find((img) => img.id === imageId);
    if (!target) {
        throw new Error('Imagen no encontrada');
    }

    product.imagenes = product.imagenes.map((img) => ({
        ...img,
        principal: img.id === imageId,
    }));
    product.updatedAt = '2026-05-28T12:30:00';
    return { ...target, principal: true };
}

resetDynamicProducts();
