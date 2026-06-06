import { getProductMainImageUrl } from '@/entities/product';
import type { ProductApi } from '@/entities/product';
import type { CartApi } from './schemas/api';
import type { CartItemUiView, CartLineView, CartSummaryView } from './types';

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

/** Mapea respuesta API + catálogo a ítems usados por CartProvider y checkout. */
export function mapCartApiToUiItems(
    cart: CartApi | null | undefined,
    productos: ProductApi[] = []
): CartItemUiView[] {
    if (!cart?.items?.length) return [];

    return cart.items.map((item) => {
        const producto = productos.find((p) => p.id === item.productoId);
        const imageUrl = producto ? getProductMainImageUrl(producto) ?? '' : '';
        const altText = producto?.nombre ?? item.nombreProducto;

        return {
            id: item.id,
            productoId: item.productoId,
            name: item.nombreProducto,
            sku: item.skuProducto,
            price: item.precioUnitario,
            quantity: item.cantidad,
            qty: item.cantidad,
            subtotal: item.subtotal,
            imageUrl,
            altText,
        };
    });
}
