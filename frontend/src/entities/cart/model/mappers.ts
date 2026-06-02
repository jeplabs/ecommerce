import type { CartApi } from './schemas/api';
import type { CartLineView, CartSummaryView } from './types';

export function mapCartItemApiToLineView(
    item: CartApi['items'][number],
    imageUrl?: string | null
): CartLineView {
    return {
        id: item.id,
        productoId: item.productoId,
        nombre: item.nombreProducto,
        sku: item.skuProducto,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        imageUrl: imageUrl ?? null,
    };
}

export function mapCartApiToSummary(cart: CartApi): CartSummaryView {
    return {
        id: cart.id,
        total: cart.total,
        totalItems: cart.totalItems,
        expiraAt: cart.expiraAt ?? null,
        items: cart.items.map((item) => mapCartItemApiToLineView(item)),
    };
}

export function isCartEmpty(cart: CartApi): boolean {
    return cart.items.length === 0 || cart.totalItems === 0;
}
