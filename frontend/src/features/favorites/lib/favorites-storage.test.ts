import { describe, expect, it, beforeEach } from 'vitest';
import {
    getFavoritesStorageKey,
    isFavoriteProduct,
    listFavorites,
    removeFavorite,
    saveFavorite,
    toggleFavoriteStorage,
} from './favorites-storage';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';

const favoriteItem = {
    productId: mockProduct.id,
    slug: mockProduct.slug,
    nombre: mockProduct.nombre,
    precioVenta: mockProduct.precioVenta,
    moneda: mockProduct.moneda,
    imagenUrl: 'https://example.com/img.png',
    guardadoAt: '2026-05-28T10:00:00.000Z',
};

describe('favorites-storage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('usa clave por JWT sub cuando el token es válido', () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);

        expect(getFavoritesStorageKey()).toBe('ecommerce:favoritos:v1:1');
    });

    it('usa clave guest sin token válido', () => {
        expect(getFavoritesStorageKey()).toBe('ecommerce:favoritos:v1:guest');
    });

    it('guarda, lista y elimina favoritos', () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);

        saveFavorite(favoriteItem);

        expect(isFavoriteProduct(mockProduct.id)).toBe(true);
        expect(listFavorites()[0]?.nombre).toBe(mockProduct.nombre);

        removeFavorite(mockProduct.id);

        expect(isFavoriteProduct(mockProduct.id)).toBe(false);
        expect(listFavorites()).toHaveLength(0);
    });

    it('toggleFavoriteStorage agrega y quita', () => {
        localStorage.setItem('token', mockAuthTokenResponse.token);

        expect(toggleFavoriteStorage(favoriteItem)).toBe(true);
        expect(isFavoriteProduct(mockProduct.id)).toBe(true);

        expect(toggleFavoriteStorage(favoriteItem)).toBe(false);
        expect(isFavoriteProduct(mockProduct.id)).toBe(false);
    });
});
