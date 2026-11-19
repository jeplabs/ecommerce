import type { FavoriteProduct } from '@/features/favorites/model/types';
import { findDynamicProductById } from './products-registry';

let favorites: FavoriteProduct[] = [];
let nextCreatedAt = 1000;

function buildFavorite(productId: number): FavoriteProduct | undefined {
    const product = findDynamicProductById(productId);
    if (!product) {
        return undefined;
    }

    const imagen = product.imagenes.find((img) => img.principal) ?? product.imagenes[0];
    return {
        productId: product.id,
        slug: product.slug,
        nombre: product.nombre,
        precioVenta: product.precioVenta,
        moneda: product.moneda ?? null,
        imagenUrl: imagen?.url ?? null,
        guardadoAt: '2026-05-28T10:00:00',
    };
}

export function resetDynamicFavorites() {
    favorites = [];
    nextCreatedAt = 1000;
}

export function getDynamicFavorites(): FavoriteProduct[] {
    return favorites.map((favorite) => ({ ...favorite }));
}

export function getDynamicFavoriteIds(): number[] {
    return favorites.map((favorite) => favorite.productId);
}

export function getDynamicFavoritesPage(page = 0, size = 12) {
    const list = getDynamicFavorites();
    const start = page * size;
    const content = list.slice(start, start + size);
    return {
        content,
        totalElements: list.length,
        totalPages: Math.max(1, Math.ceil(list.length / size)),
        size,
        number: page,
        first: page === 0,
        last: start + size >= list.length,
        empty: content.length === 0,
        numberOfElements: content.length,
    };
}

export function addDynamicFavorite(productId: number): FavoriteProduct {
    const existing = favorites.find((favorite) => favorite.productId === productId);
    if (existing) {
        return { ...existing };
    }

    const favorite = buildFavorite(productId);
    if (!favorite) {
        throw new Error('Producto no encontrado');
    }

    const created = {
        ...favorite,
        guardadoAt: `2026-05-28T${String(nextCreatedAt / 100).padStart(2, '0')}:00:00`,
    };
    nextCreatedAt += 100;
    favorites.unshift(created);
    return { ...created };
}

export function removeDynamicFavorite(productId: number): void {
    const exists = favorites.some((favorite) => favorite.productId === productId);
    if (!exists) {
        throw new Error('El producto no está en tus favoritos');
    }
    favorites = favorites.filter((favorite) => favorite.productId !== productId);
}
