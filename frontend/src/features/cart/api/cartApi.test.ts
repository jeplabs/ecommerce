import { describe, expect, it } from 'vitest';
import { cartApi } from './cartApi';
import { mockAuthTokenResponse } from '@/test/msw/fixtures/auth';
import { getDynamicCart } from '@/test/msw/fixtures/cart-registry';
import { mockProduct } from '@/test/msw/fixtures/products';

function seedAuth() {
    localStorage.setItem('token', mockAuthTokenResponse.token);
}

describe('cartApi', () => {
    it('getCart devuelve carrito vacío inicial', async () => {
        seedAuth();

        const cart = await cartApi.getCart();

        expect(cart.items).toHaveLength(0);
        expect(cart.total).toBe(0);
    });

    it('addToCart agrega un producto', async () => {
        seedAuth();

        const cart = await cartApi.addToCart(mockProduct.id, 1);

        expect(cart.items).toHaveLength(1);
        expect(cart.items[0]?.nombreProducto).toBe(mockProduct.nombre);
        expect(cart.totalItems).toBe(1);
    });

    it('updateItemQuantity actualiza cantidad', async () => {
        seedAuth();
        const added = await cartApi.addToCart(mockProduct.id, 1);
        const itemId = added.items[0]!.id;

        const updated = await cartApi.updateItemQuantity(itemId, 3);

        expect(updated.items[0]?.cantidad).toBe(3);
        expect(updated.totalItems).toBe(3);
    });

    it('removeItem elimina un ítem', async () => {
        seedAuth();
        const added = await cartApi.addToCart(mockProduct.id, 1);
        const itemId = added.items[0]!.id;

        const cart = await cartApi.removeItem(itemId);

        expect(cart.items).toHaveLength(0);
        expect(cart.total).toBe(0);
    });

    it('clearCart vacía el carrito', async () => {
        seedAuth();
        await cartApi.addToCart(mockProduct.id, 2);

        const cart = await cartApi.clearCart();

        expect(cart.items).toHaveLength(0);
        expect(getDynamicCart().totalItems).toBe(0);
    });
});
