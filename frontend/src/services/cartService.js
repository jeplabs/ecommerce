/**
 * Fachada de compatibilidad: implementación en entities/cart/api.
 * @deprecated Preferir `import { cartApi } from '@/entities/cart'`
 */
export { cartService, cartApi, getCart, addToCart, addCartItem, updateItemQuantity, removeItem, clearCart } from '@/entities/cart/api/cartApi';
