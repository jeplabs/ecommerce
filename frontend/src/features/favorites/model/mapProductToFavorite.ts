import { getMainProductImageUrl } from '@/entities/product';
import type { ProductApi } from '@/entities/product';
import type { FavoriteProduct } from './types';

export function mapProductToFavorite(product: ProductApi): FavoriteProduct {
    return {
        productId: product.id,
        slug: product.slug,
        nombre: product.nombre,
        precioVenta: product.precioVenta,
        moneda: product.moneda,
        imagenUrl: getMainProductImageUrl(product),
        guardadoAt: new Date().toISOString(),
    };
}
