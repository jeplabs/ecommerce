import { describe, expect, it } from 'vitest';
import { favoritesApi } from './favoritesApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

describe('favoritesApi', () => {
    it('fetchFavorites devuelve lista de favoritos', async () => {
        seedAuth();

        const favorites = await favoritesApi.fetchFavorites();
        expect(Array.isArray(favorites)).toBe(true);
    });

    it('addFavorite agrega un producto a favoritos', async () => {
        seedAuth();

        const added = await favoritesApi.addFavorite(mockProduct.id);
        expect(added.productId).toBe(mockProduct.id);
        expect(added.nombre).toBe(mockProduct.nombre);
    });

    it('removeFavorite elimina un producto de favoritos', async () => {
        seedAuth();

        await favoritesApi.addFavorite(mockProduct.id);
        await expect(favoritesApi.removeFavorite(mockProduct.id)).resolves.not.toThrow();
    });
});
