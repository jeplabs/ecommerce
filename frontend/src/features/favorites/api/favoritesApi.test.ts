import { describe, expect, it } from 'vitest';
import { favoritesApi } from './favoritesApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { mockProduct } from '@/test/msw/fixtures/products';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

describe('favoritesApi', () => {
    it('fetchFavorites devuelve página de favoritos', async () => {
        seedAuth();

        const page = await favoritesApi.fetchFavorites();
        expect(Array.isArray(page.content)).toBe(true);
        expect(typeof page.totalElements).toBe('number');
        expect(typeof page.totalPages).toBe('number');
    });

    it('fetchFavoriteIds devuelve array de IDs de favoritos', async () => {
        seedAuth();

        await favoritesApi.addFavorite(mockProduct.id);
        const ids = await favoritesApi.fetchFavoriteIds();
        expect(Array.isArray(ids)).toBe(true);
        expect(ids).toContain(mockProduct.id);
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
