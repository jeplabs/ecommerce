export const PRODUCT_PLACEHOLDER_IMAGE = '/images/product-placeholder.svg';

export function resolveProductImageUrl(url?: string | null): string {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return PRODUCT_PLACEHOLDER_IMAGE;
    }
    return url;
}

