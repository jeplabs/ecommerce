import { PRODUCT_PLACEHOLDER_IMAGE } from '@/shared/assets/product-placeholder';

/**
 * URLs de imágenes tolerando respuestas legacy (admin, catálogo sin parsear).
 */
export function getProductImageUrls(producto: {
    imagenesUrl?: string[];
    imagenes?: Array<{ id?: number | string; url?: string; principal?: boolean }>;
    images?: Array<string | { url?: string }>;
} | null | undefined): string[] {
    if (!producto) return [];

    if (Array.isArray(producto.imagenesUrl)) {
        return producto.imagenesUrl.filter(Boolean);
    }

    if (Array.isArray(producto.imagenes)) {
        return producto.imagenes
            .filter((img) => img && typeof img.url === 'string' && img.url.trim() !== '')
            .slice()
            .sort((a, b) => {
                const ap = a.principal ? 1 : 0;
                const bp = b.principal ? 1 : 0;
                if (ap !== bp) return bp - ap;
                const aid = typeof a.id === 'number' ? a.id : Number(a.id) || 0;
                const bid = typeof b.id === 'number' ? b.id : Number(b.id) || 0;
                return aid - bid;
            })
            .map((img) => img.url as string);
    }

    if (Array.isArray(producto.images)) {
        return producto.images
            .map((img) => (typeof img === 'string' ? img : img?.url))
            .filter(Boolean) as string[];
    }

    return [];
}

export function getMainProductImageUrl(
    producto: Parameters<typeof getProductImageUrls>[0]
): string {
    return getProductImageUrls(producto)[0] || PRODUCT_PLACEHOLDER_IMAGE;
}
