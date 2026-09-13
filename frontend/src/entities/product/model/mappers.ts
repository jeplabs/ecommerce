import { PRODUCT_PLACEHOLDER_IMAGE } from '@/shared/assets/product-placeholder';
import type { ProductImageApi } from './schemas/api';
import type { ProductApi, ProductCardView, ProductDetailView } from './types';

function resolveMainImageUrl(product: ProductApi): string {
    const imagenes = product.imagenes ?? [];
    const principal = imagenes.find((i: ProductImageApi) => i.principal);
    return principal?.url ?? imagenes[0]?.url ?? PRODUCT_PLACEHOLDER_IMAGE;
}

export function mapProductApiToCard(product: ProductApi): ProductCardView {
    return {
        id: product.id,
        sku: product.sku,
        nombre: product.nombre,
        slug: product.slug,
        precioVenta: product.precioVenta,
        moneda: product.moneda,
        imagenUrl: resolveMainImageUrl(product),
        estado: product.estado,
        stock: product.stock,
    };
}

export function mapProductApiToDetail(product: ProductApi): ProductDetailView {
    return {
        ...mapProductApiToCard(product),
        descripcion: product.descripcion ?? null,
        specs: (product.specs as Record<string, unknown> | null) ?? null,
        imagenes: product.imagenes,
        categorias: product.categorias,
    };
}

export function getProductMainImageUrl(product: ProductApi): string | null {
    return resolveMainImageUrl(product);
}
