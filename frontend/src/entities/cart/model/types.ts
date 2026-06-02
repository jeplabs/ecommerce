export type { CartApi, CartItemApi, CartStatus } from './schemas/api';
export type { AddCartItemRequest, UpdateCartItemQuantityRequest } from './schemas/forms';

export { cartStatusSchema, cartItemApiSchema, cartApiSchema } from './schemas/api';
export {
    addCartItemRequestSchema,
    updateCartItemQuantityRequestSchema,
} from './schemas/forms';

export type CartLineView = {
    id: number;
    productoId: number;
    nombre: string;
    sku: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    imageUrl?: string | null;
};

export type CartSummaryView = {
    id: number;
    total: number;
    totalItems: number;
    items: CartLineView[];
    expiraAt?: string | null;
};
