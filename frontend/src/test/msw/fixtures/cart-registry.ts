import type { CartApi, CartItemApi } from '@/entities/cart/model/schemas/api';
import { mockEmptyCart } from './cart';
import { mockCatalogProducts } from './products';

type CartLine = {
    id: number;
    productoId: number;
    cantidad: number;
};

let nextItemId = 100;
let lines: CartLine[] = [];

export function resetDynamicCart() {
    lines = [];
    nextItemId = 100;
}

function findProduct(productoId: number) {
    return mockCatalogProducts.find((product) => product.id === productoId);
}

function buildItem(line: CartLine): CartItemApi | null {
    const product = findProduct(line.productoId);
    if (!product) return null;

    const precio = product.precioVenta;
    return {
        id: line.id,
        productoId: line.productoId,
        nombreProducto: product.nombre,
        skuProducto: product.sku,
        cantidad: line.cantidad,
        precioUnitario: precio,
        subtotal: precio * line.cantidad,
    };
}

export function buildDynamicCartApi(): CartApi {
    const items = lines
        .map(buildItem)
        .filter((item): item is CartItemApi => item !== null);

    if (items.length === 0) {
        return { ...mockEmptyCart };
    }

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);
    const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

    return {
        id: 1,
        estado: 'ACTIVO',
        expiraAt: null,
        items,
        total,
        totalItems,
    };
}

export function getDynamicCart(): CartApi {
    return buildDynamicCartApi();
}

export function addDynamicCartItem(productoId: number, cantidad: number): CartApi {
    const product = findProduct(productoId);
    if (!product) {
        throw new Error('Producto no encontrado');
    }

    const existing = lines.find((line) => line.productoId === productoId);
    if (existing) {
        existing.cantidad += cantidad;
    } else {
        lines.push({ id: nextItemId++, productoId, cantidad });
    }

    return buildDynamicCartApi();
}

export function updateDynamicCartItem(itemId: number, cantidad: number): CartApi {
    const line = lines.find((entry) => entry.id === itemId);
    if (!line) {
        throw new Error('Ítem no encontrado en el carrito');
    }

    if (cantidad <= 0) {
        lines = lines.filter((entry) => entry.id !== itemId);
    } else {
        line.cantidad = cantidad;
    }

    return buildDynamicCartApi();
}

export function removeDynamicCartItem(itemId: number): CartApi {
    lines = lines.filter((entry) => entry.id !== itemId);
    return buildDynamicCartApi();
}

export function clearDynamicCart(): CartApi {
    lines = [];
    return buildDynamicCartApi();
}
